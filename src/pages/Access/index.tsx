// 权限演示页面
// 展示路由级（菜单显隐）和按钮级（组件渲染）权限控制

import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Alert, Descriptions, Divider, Space, Tag, Typography } from 'antd';
import React from 'react';
import AccessButton from '@/components/Access/AccessButton';
import { usePermission } from '@/hooks/usePermission';
import { BUTTON_PERMISSIONS } from '@/constants';

const { Text } = Typography;

const AccessPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { permissions, isAdmin, can } = usePermission();

  return (
    <PageContainer
      header={{
        title: '权限演示',
        breadcrumb: {},
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 当前用户信息 */}
        <Alert
          type="info"
          showIcon
          message={`当前用户：${initialState?.currentUser?.name} (${initialState?.currentUser?.role})`}
          description={`Token: ${initialState?.token || '无'}`}
        />

        {/* 路由级权限 */}
        <Descriptions title="路由级权限（菜单显隐）" bordered column={1}>
          <Descriptions.Item label="拥有权限">
            <Space wrap>
              {permissions.map((p) => (
                <Tag key={p} color="blue">
                  {p}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="可见菜单">
            <Text>
              {can('home') ? '✅ 首页 ' : '❌ 首页 '}
              {can('access:read') ? '✅ 权限演示 ' : '❌ 权限演示 '}
              {can('demo') ? '✅ 组件展示 ' : '❌ 组件展示 '}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* 按钮级权限 */}
        <Descriptions title="按钮级权限（组件渲染控制）" bordered column={1}>
          <Descriptions.Item label="创建用户 (user:create)">
            <AccessButton
              permission={BUTTON_PERMISSIONS.USER_CREATE}
              type="primary"
              size="small"
              fallback={<Tag color="red">无权限（按钮不显示）</Tag>}
            >
              创建用户
            </AccessButton>
            <Text type="secondary" style={{ marginLeft: 12, fontSize: 12 }}>
              {can(BUTTON_PERMISSIONS.USER_CREATE)
                ? '✓ 有权限，按钮可见'
                : '✗ 无权限，按钮隐藏'}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="编辑用户 (user:edit)">
            <AccessButton
              permission={BUTTON_PERMISSIONS.USER_EDIT}
              size="small"
              fallback={<Tag color="orange">无权限（按钮不显示）</Tag>}
            >
              编辑用户
            </AccessButton>
            <Text type="secondary" style={{ marginLeft: 12, fontSize: 12 }}>
              {can(BUTTON_PERMISSIONS.USER_EDIT)
                ? '✓ 有权限，按钮可见'
                : '✗ 无权限，按钮隐藏'}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="删除用户 (user:delete)">
            <AccessButton
              permission={BUTTON_PERMISSIONS.USER_DELETE}
              danger
              size="small"
              fallback={<Tag color="red">无权限（按钮不显示）</Tag>}
            >
              删除用户
            </AccessButton>
            <Text type="secondary" style={{ marginLeft: 12, fontSize: 12 }}>
              {can(BUTTON_PERMISSIONS.USER_DELETE)
                ? '✓ 有权限，按钮可见'
                : '✗ 无权限，按钮隐藏'}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        <Alert
          type="warning"
          showIcon
          message="提示"
          description="切换不同账号登录（admin / editor / viewer，密码均为 123456）可以看到不同的菜单和按钮。"
        />
      </Space>
    </PageContainer>
  );
};

export default AccessPage;
