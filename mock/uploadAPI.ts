// Mock 上传接口
import type { Request, Response } from 'express';

// 模拟文件存储
const uploadedFiles: { url: string; filename: string; size: number }[] = [];

export default {
  // REST 图片上传
  'POST /api/upload/image': (req: Request, res: Response) => {
    // 模拟上传延迟
    setTimeout(() => {
      const filename = `image_${Date.now()}.png`;
      const url = `https://picsum.photos/seed/${Date.now()}/400/300`;
      const result = { url, filename, size: Math.floor(Math.random() * 5000000) };
      uploadedFiles.push(result);

      res.json({
        success: true,
        code: 200,
        msg: '上传成功',
        data: result,
      });
    }, 500);
  },

  // REST 文件上传
  'POST /api/upload/file': (req: Request, res: Response) => {
    setTimeout(() => {
      const filename = `file_${Date.now()}.pdf`;
      const url = `https://example.com/files/${filename}`;
      const result = { url, filename, size: Math.floor(Math.random() * 10000000) };
      uploadedFiles.push(result);

      res.json({
        success: true,
        code: 200,
        msg: '上传成功',
        data: result,
      });
    }, 800);
  },

  // OSS 临时凭证获取
  'POST /api/oss/token': (_req: Request, res: Response) => {
    res.json({
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
    });
  },

  // 获取已上传的文件列表（调试用）
  'GET /api/upload/files': (_req: Request, res: Response) => {
    res.json({
      success: true,
      code: 200,
      data: uploadedFiles,
    });
  },
};
