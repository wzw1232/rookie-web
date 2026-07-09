// 通用组件演示页面
// 展示：验证码输入、轮询、按钮权限、工具函数等

import AccessButton from '@/components/Access/AccessButton'
import VerificationCode from '@/components/VerificationCode'
import { usePermission } from '@/hooks/usePermission'
import { usePolling } from '@/hooks/usePolling'
import { centsToYuan, formatTimestamp } from '@/utils'
import { PageContainer } from '@ant-design/pro-components'
import { useModel } from '@umijs/max'
import {
  Button,
  Card,
  Descriptions,
  Divider,
  message,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd'
import React, { useState } from 'react'

const { Title, Text, Paragraph } = Typography

const ComponentsDemo: React.FC = () => {
  const { can, permissions, isAdmin } = usePermission()
  const { initialState } = useModel('@@initialState')

  // 验证码状态
  const [code, setCode] = useState('')
  const [codeComplete, setCodeComplete] = useState(false)

  // 轮询演示状态
  const [pollCount, setPollCount] = useState(0)
  const [pollStatus, setPollStatus] = useState<'idle' | 'running' | 'done'>(
    'idle',
  )

  const { start: startPolling, stop: stopPolling } = usePolling(
    async () => {
      setPollCount((c) => c + 1)
    },
    { interval: 1000, maxCount: 10 },
  )

  return (
    <PageContainer
      header={{
        title: '通用组件演示',
        breadcrumb: {},
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 权限信息 */}
        <Card title="当前用户权限信息">
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="用户名">
              {initialState?.currentUser?.name}
            </Descriptions.Item>
            <Descriptions.Item label="角色">
              <Tag color={isAdmin ? 'red' : 'blue'}>
                {initialState?.currentUser?.role || '未知'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="拥有权限" span={2}>
              <Space wrap>
                {permissions.map((perm) => (
                  <Tag key={perm} color="green">
                    {perm}
                  </Tag>
                ))}
                {permissions.length === 0 && (
                  <Text type="secondary">无权限</Text>
                )}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 按钮权限演示 */}
        <Card title="按钮权限演示 (AccessButton)">
          <Paragraph type="secondary">
            以下按钮根据当前用户权限动态显隐。admin 可看到全部，editor
            只能看到编辑，viewer 三个按钮都不显示。
          </Paragraph>
          <Space>
            <AccessButton
              permission="user:create"
              type="primary"
              onClick={() => message.info('创建用户 (admin 专属)')}
            >
              创建用户 (需 user:create)
            </AccessButton>
            <AccessButton
              permission="user:edit"
              onClick={() => message.info('编辑用户')}
            >
              编辑用户 (需 user:edit)
            </AccessButton>
            <AccessButton
              permission="user:delete"
              danger
              onClick={() => message.info('删除用户 (admin 专属)')}
            >
              删除用户 (需 user:delete)
            </AccessButton>
            <Button
              onClick={() =>
                message.info(`can('user:delete') = ${can('user:delete')}`)
              }
            >
              检查权限
            </Button>
          </Space>
        </Card>

        {/* 手机验证码 */}
        <Card title="手机验证码输入 (VerificationCode)">
          <Paragraph type="secondary">
            支持中英文 IME
            输入，自动聚焦，退格删除，粘贴。试试切换中文输入法输入数字。
          </Paragraph>
          <Space direction="vertical" align="center">
            <VerificationCode
              length={6}
              value={code}
              onInput={setCode}
              onChange={(val) => {
                setCode(val)
                setCodeComplete(true)
                message.success(`验证码输入完成: ${val}`)
              }}
              size="large"
            />
            <Text type="secondary">
              {codeComplete
                ? `已输入完整验证码: ${code}`
                : `已输入 ${code.length} 位: ${code || '(空)'}`}
            </Text>
            <Button
              onClick={() => {
                setCode('')
                setCodeComplete(false)
              }}
            >
              重置
            </Button>

            <Divider />

            <Text strong>不同尺寸：</Text>
            <Space>
              <VerificationCode length={4} size="small" />
            </Space>

            <Divider />

            <Text strong>错误态：</Text>
            <VerificationCode length={6} status="error" value="123" />
          </Space>
        </Card>

        {/* 轮询演示 */}
        <Card title="轮询演示 (usePolling)">
          <Paragraph type="secondary">
            每秒轮询一次，最多 10 次自动停止。也可手动停止。
          </Paragraph>
          <Space direction="vertical" align="center" size="large">
            <Statistic title="轮询次数" value={pollCount} suffix={`/ 10`} />
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  setPollStatus('running')
                  startPolling()
                }}
                disabled={pollStatus === 'running'}
              >
                开始轮询
              </Button>
              <Button
                onClick={() => {
                  stopPolling()
                  setPollStatus('done')
                }}
                disabled={pollStatus !== 'running'}
              >
                停止轮询
              </Button>
              <Button
                onClick={() => {
                  stopPolling()
                  setPollCount(0)
                  setPollStatus('idle')
                }}
              >
                重置
              </Button>
            </Space>
            {pollCount >= 10 && pollStatus === 'running' && (
              <Tag color="green">已完成 10 次轮询，自动停止</Tag>
            )}
          </Space>
        </Card>

        {/* 工具函数演示 */}
        <Card title="工具函数演示">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="centsToYuan(12345)">
              <Text code>{centsToYuan(12345)}</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                分 → 元 (保留2位小数)
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="centsToYuan(9900)">
              <Text code>{centsToYuan(9900)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="formatTimestamp(Date.now())">
              <Text code>{formatTimestamp(Date.now())}</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                时间戳 → YYYY-MM-DD HH:mm:ss
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label='formatTimestamp("2024-01-01", "YYYY/MM/DD")'>
              <Text code>{formatTimestamp('2024-01-01', 'YYYY/MM/DD')}</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                自定义格式
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </PageContainer>
  )
}

export default ComponentsDemo
