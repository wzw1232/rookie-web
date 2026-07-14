/**
 * RightContent — 顶部右侧内容区
 *
 * ## 数据来源
 * - 用户信息 → `useUserStore` (Zustand)
 * - Umi initialState 仍用于布局兼容
 *
 * ## 行为
 * - 未登录：显示 Spin 加载态
 * - 已登录：显示头像 + 用户名 + 下拉菜单（退出登录）
 * - 退出登录：调用 `useUserStore.logout()` → 清空 token/user → 跳转登录页
 */

import { useUserStore } from '@/stores/useUserStore'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { history, useModel } from '@umijs/max'
import type { MenuProps } from 'antd'
import { Avatar, Dropdown, message, Spin } from 'antd'
import React, { useCallback } from 'react'

const RightContent: React.FC = () => {
  // ---- 从 Zustand 读取用户状态 ----
  const currentUser = useUserStore((s) => s.currentUser)
  const logout = useUserStore((s) => s.logout)

  // ---- 兼容 Umi @@initialState（供其他 Umi 插件使用） ----
  const { setInitialState } = useModel('@@initialState')

  /**
   * 退出登录
   * 1. Zustand store 清空 token/user/permissions
   * 2. 同步清除 Umi @@initialState
   * 3. 跳转到登录页
   */
  const handleLogout = useCallback(() => {
    logout() // Zustand: 清空 state + 触发 persist 清理 localStorage
    setInitialState({
      permissions: [],
      token: null,
      currentUser: undefined,
    })
    message.success('已退出登录')
    history.push('/user/login')
  }, [logout, setInitialState])

  // ---- 未登录态 ----
  if (!currentUser) {
    return (
      <div
        onClick={() => {
          history.push('/user/login')
          message.success('请先登录')
        }}
      >
        <Spin size="small" style={{ marginRight: 24 }} />
      </div>
    )
  }

  // ---- 下拉菜单项 ----
  const items: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  // ---- 渲染 ----
  return (
    <Dropdown menu={{ items }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          paddingRight: 16,
        }}
      >
        <Avatar
          size="small"
          icon={<UserOutlined />}
          src={currentUser.avatar}
          style={{ marginRight: 8 }}
        />
        <span>{currentUser.name || currentUser.username}</span>
      </div>
    </Dropdown>
  )
}

export default RightContent
