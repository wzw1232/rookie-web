// 上传组件演示页面

import { PageContainer } from '@ant-design/pro-components';
import { Card, Divider, Radio, Space, Typography } from 'antd';
import React, { useState } from 'react';
import ImageUpload from '@/components/Upload/ImageUpload';
import FileUpload from '@/components/Upload/FileUpload';

const { Title, Text } = Typography;

const UploadDemo: React.FC = () => {
  const [mode, setMode] = useState<'api' | 'oss'>('api');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [fileList, setFileList] = useState<
    { url: string; name: string; size: number }[]
  >([]);

  return (
    <PageContainer
      header={{
        title: '上传组件演示',
        breadcrumb: {},
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 模式切换 */}
        <Card size="small">
          <Space>
            <Text strong>上传模式：</Text>
            <Radio.Group
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              optionType="button"
            >
              <Radio.Button value="api">REST API</Radio.Button>
              <Radio.Button value="oss">OSS 直传</Radio.Button>
            </Radio.Group>
            <Text type="secondary" style={{ fontSize: 12 }}>
              (OSS 模式使用 Mock 凭证模拟)
            </Text>
          </Space>
        </Card>

        {/* 图片上传 */}
        <Card title="图片上传">
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            支持多选并发上传，点击图片可预览，支持拖拽排序（REST / OSS 双模式）
          </Text>
          <ImageUpload
            mode={mode}
            maxCount={5}
            maxSize={10}
            value={imageUrls}
            onChange={setImageUrls}
          />
          <Divider />
          <Text type="secondary">已上传 URL：</Text>
          <pre style={preStyle}>
            {JSON.stringify(imageUrls, null, 2) || '[]'}
          </pre>
        </Card>

        {/* 文件上传 */}
        <Card title="文件上传">
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            支持拖拽上传，多文件并发，进度实时展示
          </Text>
          <FileUpload
            mode={mode}
            maxCount={10}
            maxSize={50}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
            value={fileList}
            onChange={setFileList}
          />
          <Divider />
          <Text type="secondary">已上传文件：</Text>
          <pre style={preStyle}>
            {JSON.stringify(fileList, null, 2) || '[]'}
          </pre>
        </Card>
      </Space>
    </PageContainer>
  );
};

const preStyle: React.CSSProperties = {
  background: '#f5f5f5',
  padding: 12,
  borderRadius: 6,
  fontSize: 12,
  maxHeight: 200,
  overflow: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
};

export default UploadDemo;
