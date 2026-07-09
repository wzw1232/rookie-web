// 通用 API 封装
import { request } from '@umijs/max';

/**
 * 通用 GET 请求
 */
export async function get<T = any>(
  url: string,
  params?: Record<string, any>,
): Promise<T> {
  return request<T>(url, { method: 'GET', params });
}

/**
 * 通用 POST 请求
 */
export async function post<T = any>(
  url: string,
  data?: Record<string, any>,
): Promise<T> {
  return request<T>(url, { method: 'POST', data });
}

/**
 * 通用 PUT 请求
 */
export async function put<T = any>(
  url: string,
  data?: Record<string, any>,
): Promise<T> {
  return request<T>(url, { method: 'PUT', data });
}

/**
 * 通用 DELETE 请求
 */
export async function del<T = any>(
  url: string,
  params?: Record<string, any>,
): Promise<T> {
  return request<T>(url, { method: 'DELETE', params });
}
