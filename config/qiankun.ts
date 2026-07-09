import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'demo',
    entry: '//localhost:123890',
    container: '#container',
    activeRule: '/app-react',
  },
]);
// 启动 qiankun
start();