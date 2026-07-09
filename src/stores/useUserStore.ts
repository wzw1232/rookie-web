/**
 * ============================================================
 * useUserStore — 用户认证与权限状态管理 (Zustand)
 * ============================================================
 *
 * ## 职责范围
 * - 登录态管理 (token、currentUser)
 * - 权限列表维护 (permissions)
 * - 登录/退出/获取用户信息 等业务动作
 *
 * ## 与 Umi `@@initialState` 的关系
 * - `app.tsx` 的 `getInitialState` 负责初始化 Umi 全局状态
 * - 本 Store 同时向 `@@initialState` 写入，保证 Umi 内置
 *   access 插件和 layout 插件正常工作
 * - **读取优先用本 Store**（类型安全 + DevTools 友好）
 * - **路由级权限仍走 Umi access**（框架约定）
 *
 * ## 持久化策略
 * - token → localStorage（跨标签页同步用 `storage` 事件）
 * - userInfo → Zustand `persist` middleware（自动同步 localStorage）
 *
 * ## 使用示例
 * ```tsx
 * // 基础读取
 * const currentUser = useUserStore((s) => s.currentUser)
 * const permissions = useUserStore((s) => s.permissions)
 *
 * // 渲染优化：只订阅需要的字段
 * const isLoggedIn = useUserStore((s) => !!s.token)
 *
 * // 调用 action
 * const login = useUserStore((s) => s.login)
 * await login({ username: 'admin', password: '123456' })
 * ```
 *
 * @module stores/useUserStore
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { login as loginApi } from '@/services/user'

// ============================================================
// 类型定义
// ============================================================

/** 用户 Store 的状态字段 */
export interface UserState {
  /** JWT token（null = 未登录） */
  token: string | null
  /** 当前登录用户信息 */
  currentUser: API.UserInfo | null
  /** 用户拥有的权限标识列表，如 ['home', 'demo', 'user:create'] */
  permissions: string[]
}

/** 用户 Store 的异步动作 */
export interface UserActions {
  /**
   * 登录
   * - 调用后端 API 获取 token 和用户信息
   * - 自动写入 localStorage
   * - 成功后同步到 Umi `@@initialState`
   * @returns 是否登录成功
   */
  login: (params: { username: string; password: string; code?: string }) => Promise<boolean>

  /**
   * 退出登录
   * - 清除 store 内的 token/user/permissions
   * - 清除 localStorage 缓存
   * - 同步重置 Umi `@@initialState`
   */
  logout: () => void

  /**
   * 从 localStorage 恢复用户状态
   * 用于页面刷新后或跨标签页同步时重建登录态
   */
  hydrate: () => void

  /**
   * 直接设置用户信息（用于外部注入，如 Umi getInitialState）
   */
  setUser: (user: API.UserInfo | null, token: string | null, permissions: string[]) => void
}

/** 完整的 UserStore 类型 */
export type UserStore = UserState & UserActions

// ============================================================
// 初始状态
// ============================================================

const initialState: UserState = {
  token: null,
  currentUser: null,
  permissions: [],
}

// ============================================================
// localStorage Key 常量
// ============================================================

/** localStorage key：认证 token */
const TOKEN_KEY = 'admin_token'

/** localStorage key：用户信息 JSON */
const USER_KEY = 'admin_user'

// ============================================================
// 纯函数工具：localStorage 读写（供 middleware 和外部使用）
// ============================================================

/** 从 localStorage 读取 token */
const readToken = (): string | null => localStorage.getItem(TOKEN_KEY)

/** 写入 token 到 localStorage */
const writeToken = (val: string | null) => {
  if (val) {
    localStorage.setItem(TOKEN_KEY, val)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

/**
 * 同步 Umi `@@initialState`（框架兼容层）
 *
 * 因为 Umi 的路由权限(access)和布局(layout)强依赖 `@@initialState`，
 * 所以每次 Zustand 状态变更后需要同步写入 Umi model。
 *
 * @internal 通过 window 上的临时 API 调用，避免循环依赖
 */
const syncUmiState = (state: UserState) => {
  // Umi useModel('@@initialState').setInitialState 的外部等价调用
  // 通过 dispatch 自定义事件触发 app.tsx 中的同步逻辑
  window.dispatchEvent(
    new CustomEvent('zustand:user:sync', {
      detail: {
        currentUser: state.currentUser ?? undefined,
        permissions: state.permissions,
        token: state.token,
      },
    }),
  )
}

// ============================================================
// Store 定义
// ============================================================

/**
 * 用户状态管理 Store
 *
 * ## 架构说明
 * 使用 Zustand v5 + persist middleware：
 * - `persist` 自动将 `token`/`currentUser`/`permissions` 写入 localStorage
 * - 页面刷新后自动从 localStorage 恢复
 * - `partialize` 指定只持久化状态字段，不持久化 actions
 *
 * ## 数据流
 * ```
 * LoginForm → store.login() → API 请求 → set(token, user, permissions)
 *                                         → syncUmiState (兼容 Umi 框架)
 *                                         → localStorage (persist middleware)
 * ```
 */
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // ---- 初始状态 ----
      ...initialState,

      // ========================================================
      // Actions
      // ========================================================

      /**
       * 登录
       *
       * 流程：
       * 1. 调用 loginApi 获取 token + user
       * 2. 写入 Zustand state（触发 persist → localStorage）
       * 3. 同步到 Umi @@initialState（兼容框架）
       * 4. 返回是否成功
       */
      login: async (params) => {
        try {
          const res = await loginApi(params)
          // 适配后端返回格式：{ success, code, data: { token, user } }
          const { token, user } = res?.data ?? res ?? {}

          if (!token || !user) {
            return false
          }

          // 写入 Zustand state
          set({
            token,
            currentUser: user,
            permissions: user.permissions ?? [],
          })

          // 同步到 Umi
          syncUmiState(get())

          return true
        } catch {
          // 网络/服务端错误由 request.ts 统一处理（206 跳登录、其他 toast）
          return false
        }
      },

      /**
       * 退出登录
       *
       * 流程：
       * 1. 重置 state 为初始值
       * 2. persist middleware 自动清除 localStorage
       * 3. 同步到 Umi（告知框架用户已登出）
       */
      logout: () => {
        set({ ...initialState })
        // persist middleware 的 storage 会被 persist 自动更新
        syncUmiState(get())
      },

      /**
       * 从 localStorage 恢复用户信息
       *
       * 适用场景：
       * - 跨标签页 token 变更后调用（监听 storage 事件）
       * - 手动刷新登录态
       *
       * 注意：persist middleware 在 store 初始化时已自动恢复，
       * 此方法主要用于外部事件驱动的同步。
       */
      hydrate: () => {
        const storedToken = readToken()
        try {
          const raw = localStorage.getItem(USER_KEY)
          const user = raw ? (JSON.parse(raw) as API.UserInfo) : null
          if (storedToken && user) {
            set({
              token: storedToken,
              currentUser: user,
              permissions: user.permissions ?? [],
            })
          } else {
            set({ ...initialState })
          }
        } catch {
          set({ ...initialState })
        }
      },

      /**
       * 直接设置用户信息
       *
       * 给外部模块使用（如 app.tsx 的 getInitialState），
       * 避免外部直接操作 localStorage。
       */
      setUser: (user, token, permissions) => {
        set({
          token,
          currentUser: user,
          permissions,
        })
        syncUmiState(get())
      },
    }),
    {
      // ---- persist middleware 配置 ----
      name: 'zustand-user-store',          // localStorage key 前缀
      storage: createJSONStorage(() => localStorage),
      version: 1,                          // 版本号，用于未来迁移

      /**
       * 只持久化状态字段，不持久化 actions
       * 缩小存储体积，函数在 store 初始化时会重新注册
       */
      partialize: (state) => ({
        token: state.token,
        currentUser: state.currentUser,
        permissions: state.permissions,
      }),

      /**
       * 从 localStorage 恢复到内存时的回调
       * 可用于验证 token 是否过期等
       */
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.warn('[useUserStore] 状态恢复失败:', error)
          }
        }
      },
    },
  ),
)

// ============================================================
// 跨标签页同步
// ============================================================

/**
 * 监听其他标签页的 localStorage 变更
 * 当用户在一个标签页登录/退出，其他标签页自动同步
 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    // token 变更 → 重新 hydrate
    if (e.key === TOKEN_KEY) {
      useUserStore.getState().hydrate()
    }
    // 用户信息变更也同步
    if (e.key === USER_KEY) {
      useUserStore.getState().hydrate()
    }
  })
}
