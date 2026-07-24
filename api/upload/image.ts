/**
 * POST /api/upload/image — 图片上传
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, code: 405, msg: 'Method Not Allowed' })
  }

  // 模拟上传延迟
  await new Promise((r) => {
    setTimeout(r, 500)
  })

  const filename = `image_${Date.now()}.png`
  const url = `https://picsum.photos/seed/${Date.now()}/400/300`

  return res.json({
    success: true,
    code: 200,
    msg: '上传成功',
    data: {
      url,
      filename,
      size: Math.floor(Math.random() * 5000000),
    },
  })
}
