/**
 * 共享 Mock 数据与 Token 工具
 *
 * 将本地 mock/userAPI.ts 的数据层提取到 Vercel Serverless 共享模块，
 * 同时用 base64 编码的 Token 替代原 in-memory Map（Serverless 无状态）。
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

// ============================================================
// 类型
// ============================================================

export interface MockUser {
  id: number
  username: string
  password: string
  name: string
  avatar: string
  role: 'admin' | 'editor' | 'viewer'
  permissions: string[]
}

/** 存储在 token 中的 payload */
interface TokenPayload {
  userId: number
  ts: number
}

// ============================================================
// Mock 用户数据
// ============================================================

export const mockUsers: MockUser[] = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    name: '管理员',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    role: 'admin',
    permissions: [
      'home',
      'access:read',
      'demo',
      'demo:upload',
      'demo:components',
      'demo:group-multi-table',
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
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
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
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    role: 'viewer',
    permissions: ['home'],
  },
]

// ============================================================
// Stateless Token 工具（替代原 in-memory tokenStore）
// ============================================================

const TOKEN_PREFIX = 'mock_token_'

/** 创建 token：base64 编码 userId + 时间戳 */
export function createToken(userId: number): string {
  const payload: TokenPayload = { userId, ts: Date.now() }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64')
  return `${TOKEN_PREFIX}${encoded}`
}

/** 从 token 中解析用户（失败返回 null） */
export function parseToken(token: string): MockUser | null {
  if (!token || !token.startsWith(TOKEN_PREFIX)) return null
  try {
    const raw = token.slice(TOKEN_PREFIX.length)
    const { userId } = JSON.parse(
      Buffer.from(raw, 'base64').toString('utf8'),
    ) as TokenPayload
    return mockUsers.find((u) => u.id === userId) ?? null
  } catch {
    return null
  }
}

/** 提取不含 password 的用户信息 */
export function stripPassword(user: MockUser): Omit<MockUser, 'password'> {
  const { password, ...userInfo } = user
  void password
  return userInfo
}

// ============================================================
// Vercel 函数类型别名
// ============================================================

export type VercelHandler = (req: VercelRequest, res: VercelResponse) => void
