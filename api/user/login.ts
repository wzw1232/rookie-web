/**
 * POST /api/user/login — 登录
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createToken, mockUsers, stripPassword } from '../_lib/mockData'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, code: 405, msg: 'Method Not Allowed' })
  }

  const { username, password } = req.body ?? {}

  const user = mockUsers.find(
    (u) => u.username === username && u.password === password,
  )

  if (!user) {
    return res.json({
      success: false,
      code: 401,
      msg: '用户名或密码错误',
      data: null,
    })
  }

  const token = createToken(user.id)

  return res.json({
    success: true,
    code: 200,
    msg: '登录成功',
    data: {
      token,
      user: stripPassword(user),
    },
  })
}
