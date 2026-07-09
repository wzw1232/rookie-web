// 请求封装
// 约定后端返回状态码：
//   code === 200  → 正常响应
//   code === 206  → 未登录，清除 token 并跳转登录页
//   其他          → 统一 message.error 轻提示

import { history, type RequestConfig } from '@umijs/max';
import { message } from 'antd';
import { token } from './token';

// 接口级防抖：同一 method + path + params + data 在 300ms 内只放行一次
const DEBOUNCE_INTERVAL = 300;
const debounceMap = new Map<string, number>();

const stableStringify = (value: any): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
    .join(',')}}`;
};

const buildDebounceKey = (path: string, options: any) => {
  const method = String(options?.method || 'GET').toUpperCase();
  const params = options?.params ? stableStringify(options.params) : '';
  const data = options?.data ? stableStringify(options.data) : '';
  return `${method} ${path}?${params}#${data}`;
};

export const request: RequestConfig = {
  timeout: 60000,

  // 请求前统一注入 headers
  requestInterceptors: [
    (path, options) => {
      // 接口级防抖
      const skipDebounce = Boolean((options as any)?.skipDebounce);
      if (!skipDebounce) {
        const key = buildDebounceKey(path, options);
        const now = Date.now();
        const last = debounceMap.get(key);
        if (last !== undefined && now - last < DEBOUNCE_INTERVAL) {
          console.warn(
            `[request] debounced (<${DEBOUNCE_INTERVAL}ms): ${String(
              options?.method || 'GET',
            ).toUpperCase()} ${path}`,
          );
          // 防抖命中：返回永不 settle 的 Promise，调用方 .then/.catch 都不会触发
          return new Promise(() => {}) as any;
        }
        debounceMap.set(key, now);
      }

      const t = token.get();
      return {
        url: path,
        options: {
          ...options,
          headers: {
            Authorization: t ? `Bearer ${t}` : '',
            'x-m-app': 'cms',
            'x-m-type': 'pc',
            ...(options?.headers || {}),
          },
        },
      };
    },
  ],

  // 响应拦截：统一错误处理
  responseInterceptors: [
    (response) => {
      const { data = {} as any, config } = response;

      // 调用方标记 manualError 时跳过统一处理
      const manualError = Boolean((config as any)?.manualError);

      // code === 206: 登录态失效
      if (data?.code === 206 && !manualError) {
        const currentPath = history.location.pathname;
        const currentSearch = history.location.search;

        if (currentPath !== '/user/login') {
          try {
            token.remove();
            localStorage.removeItem('admin_user');
            localStorage.removeItem('permissions');
          } catch {
            // ignore
          }

          if (!currentSearch.includes('redirect=')) {
            history.push(
              `/user/login?redirect=${encodeURIComponent(
                currentPath + currentSearch,
              )}`,
            );
          }
        }
        // 返回 rejected Promise，让调用方的 catch 也能感知
        return Promise.reject(new Error('NOT_LOGGED_IN'));
      }

      // success === false 时轻提示，但仍然 resolve（不抛异常）
      if (
        !manualError &&
        typeof data?.success === 'boolean' &&
        !data.success
      ) {
        message.error(data.msg || '请求失败');
      }

      return response;
    },
  ],
};
