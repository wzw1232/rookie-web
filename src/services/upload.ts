// 上传相关 API
import { request } from '@umijs/max';

/**
 * REST 方式上传图片
 */
export async function uploadImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<API.UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  return request<API.UploadResult>('/api/upload/image', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    onUploadProgress: (e: { loaded: number; total: number }) => {
      if (onProgress && e.total > 0) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
}

/**
 * REST 方式上传文件
 */
export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<API.UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  return request<API.UploadResult>('/api/upload/file', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    onUploadProgress: (e: { loaded: number; total: number }) => {
      if (onProgress && e.total > 0) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
}

/**
 * 获取 OSS 临时上传凭证
 */
export async function getOSSToken(): Promise<API.OSSCredentials> {
  return request('/api/oss/token', {
    method: 'POST',
  });
}
