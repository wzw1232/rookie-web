// 首页——功能概览仪表盘

import {
  BgColorsOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  CodeOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { Card, Col, Row, Space, Statistic, Typography } from 'antd'
import React from 'react'
import { APP_NAME } from '@/constants'
import styles from './index.less'

const { Title, Paragraph, Text } = Typography

// 功能特性列表
const features = [
  {
    icon: (
      <SafetyCertificateOutlined style={{ fontSize: 36, color: '#1677ff' }} />
    ),
    title: 'RBAC 权限控制',
    desc: '路由级 + 按钮级权限，支持 admin/editor/viewer 等多角色配置，后端下发权限列表动态渲染菜单。',
  },
  {
    icon: <BgColorsOutlined style={{ fontSize: 36, color: '#52c41a' }} />,
    title: '全局水印',
    desc: '基于 Pro Components WaterMark，全局显示当前用户名水印，支持自定义字体、颜色、间距。',
  },
  {
    icon: <CloudUploadOutlined style={{ fontSize: 36, color: '#fa8c16' }} />,
    title: '文件上传组件',
    desc: '图片/文件上传组件，支持多选并发上传，REST API / OSS 直传双模式，拖拽上传，进度实时展示。',
  },
  {
    icon: <CodeOutlined style={{ fontSize: 36, color: '#722ed1' }} />,
    title: '验证码输入',
    desc: '6位手机验证码组件，兼容中英文 IME 输入法，自动聚焦、退格删除、粘贴支持。',
  },
  {
    icon: <ToolOutlined style={{ fontSize: 36, color: '#eb2f96' }} />,
    title: '工具函数',
    desc: '分→元转换、时间戳格式化 (dayjs)、轮询函数 (支持启停、次数/时间限制)。',
  },
  {
    icon: <CheckCircleOutlined style={{ fontSize: 36, color: '#13c2c2' }} />,
    title: '请求封装',
    desc: '基于 umi-request，统一处理 200/206 未登录/其他错误，支持防抖、token 注入、错误提示。',
  },
]

const HomePage: React.FC = () => {
  return (
    <PageContainer
      header={{
        title: APP_NAME,
        breadcrumb: {},
      }}
    >
      <div className={styles.container}>
        {/* 欢迎卡片 */}
        <Card style={{ marginBottom: 24 }}>
          <Space direction="vertical" size="small">
            <Title level={3} style={{ margin: 0 }}>
              欢迎使用 {APP_NAME}
            </Title>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              企业级后台管理系统模板，基于 UmiJS 4 (Max) + Ant Design 5 + Pro
              Components 构建。集成 RBAC
              权限、水印、上传组件、验证码、轮询等开箱即用的功能。
            </Paragraph>
            <Space size="large" style={{ marginTop: 8 }}>
              <Text type="secondary">
                框架：<Text strong>UmiJS 4 Max</Text>
              </Text>
              <Text type="secondary">
                UI：<Text strong>Ant Design 5 + Pro Components</Text>
              </Text>
              <Text type="secondary">
                包管理：<Text strong>pnpm</Text>
              </Text>
            </Space>
          </Space>
        </Card>

        {/* 功能特性 */}
        <Row gutter={[16, 16]}>
          {features.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.title}>
              <Card
                hoverable
                style={{ height: '100%' }}
                onClick={() => {
                  // 可跳转到对应页面
                }}
              >
                <Card.Meta
                  avatar={item.icon}
                  title={item.title}
                  description={item.desc}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* 快速入口 */}
        <Card title="权限说明" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="管理员 (admin / 123456)"
                value="全部权限"
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1677ff', fontSize: 18 }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                可访问所有菜单和操作按钮
              </Text>
            </Col>
            <Col span={8}>
              <Statistic
                title="编辑者 (editor / 123456)"
                value="部分权限"
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a', fontSize: 18 }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                可访问大部分菜单，不能删除
              </Text>
            </Col>
            <Col span={8}>
              <Statistic
                title="访客 (viewer / 123456)"
                value="仅首页"
                prefix={<UserOutlined />}
                valueStyle={{ color: '#faad14', fontSize: 18 }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                只能看到首页，无其他菜单
              </Text>
            </Col>
          </Row>
        </Card>
      </div>
    </PageContainer>
  )
}

export default HomePage
