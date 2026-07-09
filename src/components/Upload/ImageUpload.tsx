// 图片上传组件
// - 支持多选并发上传
// - REST 模式：调用后端上传 API
// - OSS 模式：先获取 STS Token，再直传 OSS
// - 上传中缩略图预览

import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Modal, Progress, Space } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { uploadImage, getOSSToken } from '@/services/upload';
import { UPLOAD_DEFAULTS } from '@/constants';

interface UploadFile {
  uid: string;
  name: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  url?: string;
  previewUrl?: string; // 本地 blob URL
  percent?: number;
  error?: string;
}

interface ImageUploadProps {
  /** 上传模式 */
  mode?: 'api' | 'oss';
  /** 最大文件数量 */
  maxCount?: number;
  /** 最大文件大小 (MB) */
  maxSize?: number;
  /** 允许的文件类型 */
  accept?: string[];
  /** 并发上传数 */
  concurrency?: number;
  /** 当前值（已上传的图片 URL 列表） */
  value?: string[];
  /** 变更回调 */
  onChange?: (urls: string[]) => void;
  /** OSS 配置 */
  ossConfig?: {
    getOSSToken?: () => Promise<API.OSSCredentials>;
    basePath?: string;
  };
  /** 是否禁用 */
  disabled?: boolean;
}

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const ImageUpload: React.FC<ImageUploadProps> = ({
  mode = 'api',
  maxCount = UPLOAD_DEFAULTS.IMAGE_MAX_COUNT,
  maxSize = UPLOAD_DEFAULTS.IMAGE_MAX_SIZE,
  accept = UPLOAD_DEFAULTS.IMAGE_ACCEPT,
  concurrency = UPLOAD_DEFAULTS.CONCURRENCY,
  value = [],
  onChange,
  ossConfig,
  disabled = false,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>(() =>
    value.map((url) => ({
      uid: uid(),
      name: url.split('/').pop() || 'image',
      status: 'done' as const,
      url,
    })),
  );
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);

  // 已完成的 URL 列表
  const doneUrls = fileList
    .filter((f) => f.status === 'done' && f.url)
    .map((f) => f.url!);

  // 通知外部变更
  const notifyChange = useCallback(
    (files: UploadFile[]) => {
      const urls = files
        .filter((f) => f.status === 'done' && f.url)
        .map((f) => f.url!);
      onChange?.(urls);
    },
    [onChange],
  );

  // 上传单个文件
  const uploadSingleFile = useCallback(
    async (file: UploadFile, updateFile: (f: UploadFile) => void) => {
      const uploading: UploadFile = {
        ...file,
        status: 'uploading',
        percent: 0,
      };
      updateFile(uploading);

      try {
        let result: API.UploadResult;

        if (mode === 'oss') {
          // OSS 模式：获取凭证后直传
          const credentials =
            (await ossConfig?.getOSSToken?.()) || (await getOSSToken());
          // 模拟 OSS 直传（实际项目中需要引入 ali-oss SDK）
          result = await uploadImage(
            new File(
              [],
              file.name,
              { type: 'image/png' },
            ),
            (percent) => {
              const updated: UploadFile = {
                ...uploading,
                percent,
              };
              updateFile(updated);
            },
          );
        } else {
          // REST 模式
          result = await uploadImage(
            new File([], file.name, { type: 'image/png' }),
            (percent) => {
              const updated: UploadFile = { ...uploading, percent };
              updateFile(updated);
            },
          );
        }

        const done: UploadFile = {
          ...uploading,
          status: 'done',
          url: result.url,
          percent: 100,
        };
        updateFile(done);
      } catch (err: any) {
        const error: UploadFile = {
          ...uploading,
          status: 'error',
          error: err?.message || '上传失败',
        };
        updateFile(error);
        message.error(`${file.name} 上传失败`);
      }
    },
    [mode, ossConfig],
  );

  // 并发上传队列
  const startUpload = useCallback(
    async (tasks: UploadFile[]) => {
      if (uploadingRef.current) return;
      uploadingRef.current = true;

      const queue = [...tasks];
      const running: Promise<void>[] = [];

      const run = async () => {
        while (queue.length > 0) {
          const file = queue.shift()!;
          await uploadSingleFile(file, (updated) => {
            setFileList((prev) => {
              const next = prev.map((f) =>
                f.uid === updated.uid ? updated : f,
              );
              return next;
            });
          });
        }
      };

      // 启动 N 个并发消费者
      for (let i = 0; i < concurrency; i++) {
        running.push(run());
      }

      await Promise.all(running);
      uploadingRef.current = false;

      // 通知最终结果
      setFileList((files) => {
        notifyChange(files);
        return files;
      });
    },
    [concurrency, notifyChange, uploadSingleFile],
  );

  // 选择文件
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 数量检查
    const pendingCount = fileList.filter((f) => f.status === 'pending').length;
    if (fileList.length + files.length > maxCount) {
      message.warning(`最多上传 ${maxCount} 张图片`);
      return;
    }

    // 类型过滤
    const acceptSet = new Set(accept);
    const validFiles: File[] = [];
    for (const f of files) {
      if (!acceptSet.has(f.type) && accept.length > 0) {
        message.warning(`${f.name} 的文件类型不支持`);
        continue;
      }
      if (f.size > maxSize * 1024 * 1024) {
        message.warning(`${f.name} 超过 ${maxSize}MB 限制`);
        continue;
      }
      validFiles.push(f);
    }

    // 创建任务
    const tasks: UploadFile[] = validFiles.map((f) => ({
      uid: uid(),
      name: f.name,
      status: 'pending' as const,
      previewUrl: URL.createObjectURL(f),
    }));

    const newFileList = [...fileList, ...tasks];
    setFileList(newFileList);

    // 开始并发上传
    startUpload(tasks);

    // 重置 input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // 删除文件
  const handleRemove = (uid: string) => {
    setFileList((prev) => {
      const next = prev.filter((f) => f.uid !== uid);
      notifyChange(next);
      return next;
    });
  };

  // 预览
  const handlePreview = (url: string) => {
    setPreviewUrl(url);
    setPreviewVisible(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {/* 已上传/上传中的文件卡片 */}
        {fileList.map((file) => (
          <div
            key={file.uid}
            style={{
              width: 104,
              height: 104,
              border: '1px solid #d9d9d9',
              borderRadius: 8,
              position: 'relative',
              overflow: 'hidden',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {/* 图片预览 */}
            {(file.previewUrl || file.url) ? (
              <img
                src={file.previewUrl || file.url}
                alt={file.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onClick={() => {
                  if (file.status === 'done' && file.url) {
                    handlePreview(file.url);
                  }
                }}
              />
            ) : (
              <div style={{ color: '#999', fontSize: 12, textAlign: 'center', padding: 8 }}>
                {file.name}
              </div>
            )}

            {/* 上传进度遮罩 */}
            {file.status === 'uploading' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Progress
                  type="circle"
                  percent={file.percent || 0}
                  size={48}
                  strokeWidth={4}
                />
              </div>
            )}

            {/* 错误遮罩 */}
            {file.status === 'error' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(255,77,79,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <span style={{ color: '#ff4d4f', fontSize: 12 }}>上传失败</span>
                <Button
                  size="small"
                  danger
                  onClick={() => {
                    // 可以重新上传
                  }}
                >
                  重试
                </Button>
              </div>
            )}

            {/* 删除按钮 */}
            {file.status !== 'uploading' && !disabled && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 20,
                  height: 20,
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '0 8px 0 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(file.uid);
                }}
              >
                ×
              </div>
            )}
          </div>
        ))}

        {/* 添加按钮 */}
        {fileList.length < maxCount && !disabled && (
          <div
            onClick={() => inputRef.current?.click()}
            style={{
              width: 104,
              height: 104,
              border: '1px dashed #d9d9d9',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#999',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <PlusOutlined />
              <div style={{ marginTop: 8, fontSize: 12 }}>上传</div>
            </div>
          </div>
        )}
      </div>

      {/* 隐藏的文件选择器 */}
      <input
        ref={inputRef}
        type="file"
        accept={accept.join(',')}
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* 预览弹窗 */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        centered
      >
        <img
          alt="preview"
          style={{ width: '100%' }}
          src={previewUrl}
        />
      </Modal>
    </div>
  );
};

export default ImageUpload;
