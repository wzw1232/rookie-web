/**
 * ============================================================
 * useAppStore — 应用全局 UI 状态管理 (Zustand)
 * ============================================================
 *
 * ## 职责范围
 * - 侧边栏折叠状态
 * - 全局 loading 状态
 * - 主题 / 暗色模式（预留）
 * - 浏览器窗口尺寸感知（预留）
 *
 * ## 设计原则
 * - **只放 UI 状态**：与业务数据无关的纯前端状态
 * - **不做持久化**：刷新后恢复默认值即可
 * - **尽量扁平**：避免深层嵌套，reduce 重渲染风险
 *
 * ## 使用示例
 * ```tsx
 * // 订阅单个字段（性能最优）
 * const collapsed = useAppStore((s) => s.collapsed)
 *
 * // 批量读取
 * const { collapsed, setCollapsed } = useAppStore()
 *
 * // 在非组件中使用
 * useAppStore.getState().setGlobalLoading(true)
 * ```
 *
 * @module stores/useAppStore
 */

import { create } from 'zustand'

// ============================================================
// 类型定义
// ============================================================

/** 侧边栏主题模式 */
export type SiderTheme = 'light' | 'dark'

/** 布局模式 */
export type LayoutMode = 'side' | 'top' | 'mix'

/** 应用 Store 的状态字段 */
export interface AppState {
  /** 侧边栏是否折叠 */
  collapsed: boolean

  /** 全局 loading（用于页面级加载遮罩） */
  globalLoading: boolean

  /** 侧边栏主题 */
  siderTheme: SiderTheme

  /** 布局模式 */
  layoutMode: LayoutMode

  /** 浏览器窗口宽度（响应式判断用） */
  windowWidth: number

  /** 是否为移动端（宽度 < 768px） */
  isMobile: boolean
}

/** 应用 Store 的动作 */
export interface AppActions {
  /** 切换侧边栏折叠 */
  toggleCollapsed: () => void

  /** 直接设置侧边栏折叠状态 */
  setCollapsed: (collapsed: boolean) => void

  /** 设置全局 loading */
  setGlobalLoading: (loading: boolean) => void

  /** 设置侧边栏主题 */
  setSiderTheme: (theme: SiderTheme) => void

  /** 设置布局模式 */
  setLayoutMode: (mode: LayoutMode) => void

  /** 更新窗口宽度（由 resize 事件触发） */
  setWindowWidth: (width: number) => void
}

/** 完整的 AppStore 类型 */
export type AppStore = AppState & AppActions

// ============================================================
// 初始状态
// ============================================================

/** 默认侧边栏主题 */
const DEFAULT_SIDER_THEME: SiderTheme = 'dark'

/** 默认布局模式 */
const DEFAULT_LAYOUT_MODE: LayoutMode = 'mix'

/** 移动端断点 (px) */
const MOBILE_BREAKPOINT = 768

/**
 * 获取初始窗口宽度（SSR 安全）
 * 在服务端渲染时默认为 1920，客户端 hydration 时更新为真实值
 */
const getInitialWidth = (): number => {
  if (typeof window === 'undefined') return 1920
  return window.innerWidth
}

// ============================================================
// Store 定义
// ============================================================

/**
 * 应用全局 UI 状态 Store
 *
 * ## 为什么不用 persist
 * - UI 状态是瞬时的，不应该跨会话保留
 * - 刷新后侧边栏折叠/展开应该恢复默认
 * - 窗口尺寸每次加载时重新检测
 *
 * ## 响应式设计
 * `windowWidth` + `isMobile` 由组件在 `resize` 事件中更新。
 * 推荐在 layout 组件中挂载一个全局的 resize listener，
 * 避免每个子组件各自监听。
 *
 * ## 使用模式
 * ```
 * // 受控折叠（ProLayout 集成用）
 * <ProLayout
 *   collapsed={collapsed}
 *   onCollapse={setCollapsed}
 * />
 * ```
 */
export const useAppStore = create<AppStore>()((set) => ({
  // ---- 初始状态 ----
  collapsed: false,
  globalLoading: false,
  siderTheme: DEFAULT_SIDER_THEME,
  layoutMode: DEFAULT_LAYOUT_MODE,
  windowWidth: getInitialWidth(),
  isMobile: getInitialWidth() < MOBILE_BREAKPOINT,

  // ========================================================
  // Actions
  // ========================================================

  /**
   * 切换侧边栏折叠状态
   * 取反当前的 collapsed 值
   */
  toggleCollapsed: () => {
    set((state) => ({ collapsed: !state.collapsed }))
  },

  /**
   * 直接设置侧边栏折叠状态
   * @param collapsed - true = 折叠, false = 展开
   */
  setCollapsed: (collapsed) => {
    set({ collapsed })
  },

  /**
   * 设置全局 loading 遮罩
   * 用于路由切换、表单提交等场景
   * @param loading - true = 显示遮罩, false = 隐藏
   */
  setGlobalLoading: (loading) => {
    set({ globalLoading: loading })
  },

  /**
   * 设置侧边栏主题
   * @param theme - 'light' | 'dark'
   */
  setSiderTheme: (theme) => {
    set({ siderTheme: theme })
  },

  /**
   * 设置布局模式
   * @param mode - 'side' | 'top' | 'mix'
   */
  setLayoutMode: (mode) => {
    set({ layoutMode: mode })
  },

  /**
   * 更新窗口宽度
   * 由全局 resize 事件监听器调用
   * 自动计算 isMobile
   * @param width - 当前窗口宽度 (px)
   */
  setWindowWidth: (width) => {
    set({
      windowWidth: width,
      isMobile: width < MOBILE_BREAKPOINT,
    })
  },
}))

// ============================================================
// 全局 resize 监听器
// ============================================================

/**
 * 在客户端挂载一个全局的 resize 监听器
 * 使用防抖减少频繁更新
 */
if (typeof window !== 'undefined') {
  let resizeTimer: ReturnType<typeof setTimeout> | null = null

  window.addEventListener('resize', () => {
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
    resizeTimer = setTimeout(() => {
      useAppStore.getState().setWindowWidth(window.innerWidth)
    }, 100) // 100ms 防抖，避免频繁 setState
  })
}
