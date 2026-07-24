/**
 * GET /api/user/current — 获取当前用户信息
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { parseToken, stripPassword } from '../_lib/mockData'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ success: false, code: 405, msg: 'Method Not Allowed' })
  }

  const authHeader = (req.headers.authorization as string) || ''
  const token = authHeader.replace('Bearer ', '')
  const user = parseToken(token)

  if (!user) {
    return res.json({
      success: false,
      code: 206,
      msg: '登录已过期，请重新登录',
      data: null,
    })
  }

  return res.json({
    success: true,
    code: 200,
    msg: 'ok',
    data: stripPassword(user),
  })
}
