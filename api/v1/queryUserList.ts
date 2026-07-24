/**
 * GET /api/v1/queryUserList — 用户列表（兼容旧接口）
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { mockUsers, stripPassword } from '../_lib/mockData'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ success: false, code: 405, msg: 'Method Not Allowed' })
  }

  return res.json({
    success: true,
    code: 200,
    data: { list: mockUsers.map((u) => stripPassword(u)) },
  })
}
