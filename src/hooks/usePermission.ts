/**
 * usePermission — 权限检查 Hook
 *
 * ## 数据来源
 * - 优先从 Zustand `useUserStore` 读取权限列表
 * - 兼容 Umi access 插件（路由级权限仍走 framework）
 *
 * ## 使用示例
 * ```tsx
 * const { can, permissions, isAdmin } = usePermission()
 *
 * // 按钮级权限检查
 * {can('user:delete') && <Button danger>删除</Button>}
 *
 * // 条件渲染
 * {isAdmin && <AdminPanel />}
 * ```
 *
 * @module hooks/usePermission
 */

import { useAccess } from '@umijs/max';
import { useUserStore } from '@/stores/useUserStore';

/**
 * 权限检查 Hook
 *
 * @returns { can, permissions, isAdmin, access }
 * - `can(perm)` — 检查是否拥有指定权限
 * - `permissions` — 当前用户的所有权限列表
 * - `isAdmin`   — 是否为管理员
 * - `access`    — Umi access 实例（路由级）
 */
export function usePermission() {
  // ---- 从 Zustand 读取权限（类型安全 + 即时响应） ----
  const permissions = useUserStore((s) => s.permissions);
  const currentUser = useUserStore((s) => s.currentUser);

  // ---- Umi access（路由菜单显隐用） ----
  const access = useAccess();

  // ---- 派生状态 ----
  const isAdmin = currentUser?.role === 'admin';

  return {
    /** 检查是否拥有指定权限 */
    can: (perm: string) => permissions.includes(perm),

    /** 当前用户权限列表 */
    permissions,

    /** 是否为管理员 */
    isAdmin,

    /** Umi access 实例（路由级权限检查用） */
    access,
  };
}
