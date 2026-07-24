/**
 * GET /api/upload/files — 已上传文件列表（调试用）
 *
 * 注意：Vercel Serverless 无状态，此处返回示例数据。
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

const sampleFiles = [
  {
    url: 'https://picsum.photos/seed/demo1/400/300',
    filename: 'demo_1.png',
    size: 2345678,
  },
  {
    url: 'https://picsum.photos/seed/demo2/400/300',
    filename: 'demo_2.png',
    size: 4123456,
  },
  {
    url: 'https://example.com/files/report.pdf',
    filename: 'report.pdf',
    size: 8192000,
  },
]

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ success: false, code: 405, msg: 'Method Not Allowed' })
  }

  return res.json({
    success: true,
    code: 200,
    data: sampleFiles,
  })
}
