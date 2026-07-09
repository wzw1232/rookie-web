import { defineConfig } from '@umijs/max'
import proxy from './proxy'
import routes from './routes'

const { REACT_APP_ENV } = process.env

export default defineConfig({
  antd: {
    // Ant Design 5 主题配置
    theme: {
      token: {
        colorPrimary: '#1668ff',
        borderRadius: 8,
      },
    },
  },
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '武帝萧子',
    // 自适应布局：mix 模式在移动端自动收起侧边栏
    layout: 'mix',
    contentWidth: 'Fluid',
    fixedHeader: true,
    fixSiderbar: true,
    breakpoint: 'lg',
    locale: false,
  },

  routes: routes,
  npmClient: 'pnpm',
  // 用 Webpack 5 替代 utoopack（Windows 下 utoopack HMR 不稳定）
  fastRefresh: true,
  mfsu: false,
  proxy: REACT_APP_ENV === 'proxy' ? proxy['dev'] : {},
  // 路由按权限过滤后，未授权的菜单项不展示
})
