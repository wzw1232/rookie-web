// 完整路由配置（RBAC 权限模型）
export default [
  // ---- 无布局路由（登录等） ----
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: '登录',
        path: '/user/login',
        component: './User/Login',
      },
    ],
  },

  // ---- 有布局路由（需要登录） ----
  {
    path: '/',
    redirect: '/home',
  },
  {
    name: '首页',
    path: '/home',
    component: './Home',
    icon: 'HomeOutlined',
    access: 'home',
  },
  {
    name: '权限演示',
    path: '/access',
    component: './Access',
    icon: 'SafetyOutlined',
    access: 'access:read',
  },
  {
    name: '组件展示',
    path: '/demo',
    icon: 'AppstoreOutlined',
    access: 'demo',
    routes: [
      {
        name: '上传组件',
        path: '/demo/upload',
        component: './Demo/Upload',
        access: 'demo:upload',
      },
      {
        name: '通用组件',
        path: '/demo/components',
        component: './Demo/Components',
        access: 'demo:components',
      },
      {
        name: '分组多行表格',
        path: '/demo/group-multi-table',
        component: './Demo/GroupMultiTable',
        access: 'demo:group-multi-table',
      },
    ],
  },

  // ---- 404 ----
  {
    path: '/*',
    component: './404',
  },
]
