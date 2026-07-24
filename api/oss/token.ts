/**
 * POST /api/oss/token — OSS 临时凭证获取
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, code: 405, msg: 'Method Not Allowed' })
  }

  return res.json({
    success: true,
    code: 200,
    msg: 'ok',
    data: {
      accessKeyId: 'mock-ak-id',
      accessKeySecret: 'mock-ak-secret',
      stsToken: 'mock-sts-token',
      region: 'oss-cn-hangzhou',
      bucket: 'mock-bucket',
      endpoint: 'https://oss-cn-hangzhou.aliyuncs.com',
    },
  })
}
