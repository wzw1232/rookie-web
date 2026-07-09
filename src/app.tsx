// 运行时配置
// 全局初始化数据 → Umi @@initialState（兼容框架内置插件）
// Zustand stores 用于业务代码中的状态管理

import { useUserStore } from '@/stores/useUserStore'
import { APP_NAME } from '@/constants'
import { WaterMark } from '@ant-design/pro-components'
import { RunTimeLayoutConfig } from '@umijs/max'
import Footer from './components/Footer'
import RightContent from './components/RightContent'
import { getUserInfo } from './services/user'

// ============================================================
// getInitialState — Umi 运行时初始化
// ============================================================
//
// 每次页面加载时执行一次，返回的 initialState 注入到：
// - Umi access 插件（路由权限判断）
// - Umi layout 插件（标题等）
// - 所有 useModel('@@initialState') 调用处
//
// **同时**将数据同步到 Zustand useUserStore，
// 业务代码应优先使用 Zustand store（类型安全 + DevTools 友好）。
//
export async function getInitialState(): Promise<API.InitialState> {
  // 从 Zustand persist 恢复（比 localStorage 裸读更可靠）
  const zustandState = useUserStore.getState()
  const storedToken = zustandState.token

  // 无 token：未登录状态
  if (!storedToken) {
    useUserStore.getState().setUser(null, null, [])
    return { permissions: [], token: null }
  }

  // 有 token：从后端获取最新用户信息
  try {
    const user = await getUserInfo()

    // 同步到 Zustand store（业务侧使用）
    useUserStore.getState().setUser(user, storedToken, user?.permissions ?? [])

    return {
      currentUser: user,
      permissions: user?.permissions ?? [],
      token: storedToken,
    }
  } catch {
    // token 过期或无效 → 清空状态
    useUserStore.getState().setUser(null, null, [])
    return { permissions: [], token: null }
  }
}

// ============================================================
// 请求配置：从 utils/request 导出
// ============================================================
export { request } from './utils/request'

// ============================================================
// Layout 运行时配置
// ============================================================
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  // ---- 监听 Zustand → Umi 的同步事件 ----
  // 当 useUserStore 状态变更时，同步更新 @@initialState
  if (typeof window !== 'undefined') {
    window.addEventListener('zustand:user:sync', ((e: CustomEvent) => {
      // Umi 内部 API：直接触发 initialState 更新
      // 见 https://umijs.org/docs/max/data-flow#%E5%85%A8%E5%B1%80%E5%88%9D%E5%A7%8B%E7%8A%B6%E6%80%81
      const detail = e.detail as API.InitialState
      // 通过 dispatch 触发 Umi model 更新
      if (detail) {
        // 触发 @@initialState 的 setInitialState
        // （实际通过 Umi 的事件系统更新，此处为预留接口）
      }
    }) as EventListener)
  }

  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    title: APP_NAME,
    menu: { locale: false },

    // ---- 自适应布局 ----
    layout: 'mix',
    contentWidth: 'Fluid',
    fixedHeader: true,
    fixSiderbar: true,
    breakpoint: 'lg',

    // ---- 右侧内容区（头像 + 退出） ----
    rightContentRender: () => <RightContent />,

    // ---- 页脚 ----
    footerRender: () => <Footer />,

    // ---- 全局水印 ----
    childrenRender: (children) => {
      const username = initialState?.currentUser?.name || '未登录'
      return (
        <WaterMark
          content={username}
          fontColor="rgba(0,0,0,0.08)"
          fontSize={16}
        >
          {children}
        </WaterMark>
      )
    },
  }
}
