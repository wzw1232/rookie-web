/**
 * ============================================================
 * Stores — 统一导出入口
 * ============================================================
 *
 * ## Store 一览
 *
 * | Store            | 文件名           | 职责                         | 持久化 |
 * |------------------|------------------|------------------------------|--------|
 * | `useUserStore`   | `useUserStore`   | 用户认证、权限、token        | ✅     |
 * | `useAppStore`    | `useAppStore`    | 侧边栏、loading、窗口尺寸    | ❌     |
 *
 * ## 添加新 Store 的规范
 * 1. 在 `src/stores/` 下新建 `use<Feature>Store.ts`
 * 2. 遵循命名约定：文件名即 hook 名（`use` 前缀 + camelCase）
 * 3. 如果需持久化：使用 `persist` middleware + `partialize`
 * 4. 在此文件补充 re-export
 *
 * ## 在组件中使用
 * ```tsx
 * import { useUserStore, useAppStore } from '@/stores'
 *
 * function MyComponent() {
 *   const currentUser = useUserStore((s) => s.currentUser)
 *   const collapsed = useAppStore((s) => s.collapsed)
 *   // ...
 * }
 * ```
 *
 * @module stores
 */

export { useUserStore } from './useUserStore'
export type { UserActions, UserState, UserStore } from './useUserStore'

export { useAppStore } from './useAppStore'
export type {
  AppActions,
  AppState,
  AppStore,
  LayoutMode,
  SiderTheme,
} from './useAppStore'
