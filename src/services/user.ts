// 用户相关 API
import { request } from '@umijs/max'

/**
 * 登录
 */
export async function login(params: {
  username: string
  password: string
  code?: string
}): Promise<{ success: boolean; code: number; data: any; message: string }> {
  return request('/api/user/login', {
    method: 'POST',
    data: params,
  })
}

/**
 * 获取当前用户信息（用于从 token 恢复登录态）
 */
export async function getUserInfo(): Promise<API.UserInfo> {
  return request('/api/user/current', {
    method: 'GET',
  })
}
