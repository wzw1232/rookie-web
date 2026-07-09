// 权限定义——统一管理路由和按钮级别的权限
// 参考文档 https://umijs.org/docs/max/access

export default (initialState: API.InitialState | undefined) => {
  const { permissions = [] } = initialState ?? {};

  return {
    /** 是否已认证（有任意权限即为已登录） */
    isAuthenticated: permissions.length > 0,

    /** 通用权限检查函数：按钮级别使用 */
    can: (perm: string) => permissions.includes(perm),

    // ---- 路由级别权限（与 config/routes.ts 中的 access 字段一一对应） ----
    home: true, // 首页所有人可见
    'access:read': permissions.includes('access:read'),
    demo: permissions.includes('demo'),
    'demo:upload': permissions.includes('demo:upload'),
    'demo:components': permissions.includes('demo:components'),
  };
};
