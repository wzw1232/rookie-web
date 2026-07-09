// Mock 用户数据（RBAC 模型：不同角色拥有不同权限）
interface MockUser {
  id: number;
  username: string;
  password: string;
  name: string;
  avatar: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
}

const mockUsers: MockUser[] = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    name: '管理员',
    avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    role: 'admin',
    permissions: [
      'home',
      'access:read',
      'demo',
      'demo:upload',
      'demo:components',
      'user:create',
      'user:edit',
      'user:delete',
    ],
  },
  {
    id: 2,
    username: 'editor',
    password: '123456',
    name: '编辑者',
    avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    role: 'editor',
    permissions: [
      'home',
      'access:read',
      'demo',
      'demo:upload',
      'demo:components',
      'user:edit',
    ],
  },
  {
    id: 3,
    username: 'viewer',
    password: '123456',
    name: '访客',
    avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    role: 'viewer',
    permissions: ['home'],
  },
];

// 模拟 token 存储
const tokenStore = new Map<string, MockUser>();

export default {
  // 登录
  'POST /api/user/login': (req: any, res: any) => {
    const { username, password } = req.body;

    const user = mockUsers.find(
      (u) => u.username === username && u.password === password,
    );

    if (!user) {
      res.json({
        success: false,
        code: 401,
        msg: '用户名或密码错误',
        data: null,
      });
      return;
    }

    // 生成简单 token
    const token = `mock_token_${user.id}_${Date.now()}`;
    tokenStore.set(token, user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...userInfo } = user;

    res.json({
      success: true,
      code: 200,
      msg: '登录成功',
      data: {
        token,
        user: userInfo,
      },
    });
  },

  // 获取当前用户信息
  'GET /api/user/current': (req: any, res: any) => {
    const authHeader: string = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    const user = tokenStore.get(token);

    if (!user) {
      res.json({
        success: false,
        code: 206,
        msg: '登录已过期，请重新登录',
        data: null,
      });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...userInfo } = user;

    res.json({
      success: true,
      code: 200,
      msg: 'ok',
      data: userInfo,
    });
  },

  // 兼容旧接口
  'GET /api/v1/queryUserList': (_req: any, res: any) => {
    res.json({
      success: true,
      code: 200,
      data: { list: mockUsers.map(({ password: _, ...u }) => u) },
    });
  },
};
