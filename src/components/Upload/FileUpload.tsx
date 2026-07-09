// 文件上传组件
// - 支持多选并发上传
// - REST 模式 / OSS 模式双支持
// - 拖拽上传区域
// - 文件列表展示：名称、大小、进度、状态

import { InboxOutlined } from '@ant-design/icons';
import { Button, List, message, Progress, Space, Typography } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { uploadFile, getOSSToken } from '@/services/upload';
import { UPLOAD_DEFAULTS } from '@/constants';

const { Text } = Typography;

interface UploadFileItem {
  uid: string;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  url?: string;
  percent?: number;
  error?: string;
}

interface FileUploadProps {
  /** 上传模式 */
  mode?: 'api' | 'oss';
  /** 最大文件数量 */
  maxCount?: number;
  /** 最大文件大小 (MB) */
  maxSize?: number;
  /** 允许的文件类型（MIME 或扩展名），如 '.pdf,.doc' */
  accept?: string;
  /** 并发上传数 */
  concurrency?: number;
  /** 当前值 */
  value?: { url: string; name: string; size: number }[];
  /** 变更回调 */
  onChange?: (files: { url: string; name: string; size: number }[]) => void;
  /** OSS 配置 */
  ossConfig?: {
    getOSSToken?: () => Promise<API.OSSCredentials>;
    basePath?: string;
  };
  /** 是否禁用 */
  disabled?: boolean;
}

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileUpload: React.FC<FileUploadProps> = ({
  mode = 'api',
  maxCount = UPLOAD_DEFAULTS.FILE_MAX_COUNT,
  maxSize = UPLOAD_DEFAULTS.FILE_MAX_SIZE,
  accept = '',
  concurrency = UPLOAD_DEFAULTS.CONCURRENCY,
  value = [],
  onChange,
  ossConfig,
  disabled = false,
}) => {
  const [fileList, setFileList] = useState<UploadFileItem[]>(() =>
    value.map((f) => ({
      uid: uid(),
      name: f.name,
      size: f.size,
      status: 'done' as const,
      url: f.url,
    })),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // 通知外部
  const notifyChange = useCallback(
    (files: UploadFileItem[]) => {
      const result = files
        .filter((f) => f.status === 'done' && f.url)
        .map((f) => ({ url: f.url!, name: f.name, size: f.size }));
      onChange?.(result);
    },
    [onChange],
  );

  // 上传单个文件
  const uploadSingle = useCallback(
    async (
      file: File,
      item: UploadFileItem,
      updateItem: (u: Partial<UploadFileItem>) => void,
    ) => {
      updateItem({ status: 'uploading', percent: 0 });

      try {
        let result: API.UploadResult;

        if (mode === 'oss') {
          await (ossConfig?.getOSSToken?.() || getOSSToken());
          result = await uploadFile(
            file,
            (percent) => updateItem({ percent }),
          );
        } else {
          result = await uploadFile(
            file,
            (percent) => updateItem({ percent }),
          );
        }

        updateItem({
          status: 'done',
          url: result.url,
          percent: 100,
          size: result.size ?? file.size,
        });
      } catch (err: any) {
        updateItem({
          status: 'error',
          error: err?.message || '上传失败',
        });
        message.error(`${file.name} 上传失败`);
      }
    },
    [mode, ossConfig],
  );

  // 添加文件并开始上传
  const addFiles = useCallback(
    (files: File[]) => {
      // 校验数量
      const pending = fileList.filter(
        (f) => f.status === 'pending' || f.status === 'uploading',
      ).length;
      if (fileList.length + files.length > maxCount) {
        message.warning(`最多上传 ${maxCount} 个文件`);
        return;
      }

      // 校验大小
      const validFiles = files.filter((f) => {
        if (f.size > maxSize * 1024 * 1024) {
          message.warning(`${f.name} 超过 ${maxSize}MB 限制`);
          return false;
        }
        return true;
      });

      // 创建上传任务
      const tasks = validFiles.map((f) => {
        const item: UploadFileItem = {
          uid: uid(),
          name: f.name,
          size: f.size,
          status: 'pending',
        };
        return { file: f, item };
      });

      const newFileList = [...fileList, ...tasks.map((t) => t.item)];
      setFileList(newFileList);

      // 并发上传（简化版：用队列 + N 个并发槽）
      const queue = [...tasks];
      let runningCount = 0;

      const runNext = async () => {
        const task = queue.shift();
        if (!task) return;

        runningCount++;
        await uploadSingle(task.file, task.item, (update) => {
          setFileList((prev) =>
            prev.map((f) =>
              f.uid === task.item.uid ? { ...f, ...update } : f,
            ),
          );
        });
        runningCount--;

        if (queue.length > 0) {
          await runNext();
        } else if (runningCount === 0) {
          setFileList((prev) => {
            notifyChange(prev);
            return prev;
          });
        }
      };

      const batchSize = Math.min(concurrency, tasks.length);
      Promise.all(Array.from({ length: batchSize }, () => runNext()));
    },
    [
      fileList,
      maxCount,
      maxSize,
      concurrency,
      uploadSingle,
      notifyChange,
    ],
  );

  // 文件选择
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) addFiles(files);
    if (inputRef.current) inputRef.current.value = '';
  };

  // 拖拽事件
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (dragCounter.current === 1) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) addFiles(files);
  };

  // 删除
  const handleRemove = (uid: string) => {
    setFileList((prev) => {
      const next = prev.filter((f) => f.uid !== uid);
      notifyChange(next);
      return next;
    });
  };

  return (
    <div>
      {/* 拖拽上传区域 */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#1677ff' : '#d9d9d9'}`,
          borderRadius: 8,
          padding: '40px 16px',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: isDragging ? '#e6f4ff' : '#fafafa',
          transition: 'all 0.2s',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <InboxOutlined
          style={{ fontSize: 48, color: isDragging ? '#1677ff' : '#999' }}
        />
        <div style={{ marginTop: 8, color: '#666' }}>
          <Text strong>点击或拖拽文件到此区域上传</Text>
        </div>
        <div style={{ marginTop: 4, color: '#999', fontSize: 12 }}>
          支持单个或批量上传，单文件不超过 {maxSize}MB
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {/* 文件列表 */}
      {fileList.length > 0 && (
        <List
          style={{ marginTop: 16 }}
          dataSource={fileList}
          renderItem={(file) => (
            <List.Item
              actions={[
                file.status !== 'uploading' && !disabled && (
                  <Button
                    key="remove"
                    type="link"
                    danger
                    size="small"
                    onClick={() => handleRemove(file.uid)}
                  >
                    删除
                  </Button>
                ),
              ].filter(Boolean)}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text
                      ellipsis
                      style={{ maxWidth: 300 }}
                      delete={file.status === 'error'}
                    >
                      {file.name}
                    </Text>
                    {file.status === 'done' && (
                      <Text type="success">上传成功</Text>
                    )}
                    {file.status === 'error' && (
                      <Text type="danger" style={{ fontSize: 12 }}>
                        {file.error || '上传失败'}
                      </Text>
                    )}
                  </Space>
                }
                description={
                  <Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatSize(file.size)}
                    </Text>
                    {file.status === 'uploading' && (
                      <Progress
                        percent={file.percent || 0}
                        size="small"
                        style={{ width: 100, margin: 0 }}
                      />
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default FileUpload;
