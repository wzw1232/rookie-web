// 轮询 Hook——带 React 生命周期管理，组件卸载自动停止

import { useEffect, useRef, useCallback } from 'react';
import { createPolling, type PollingController } from '@/utils/polling';

interface UsePollingOptions {
  /** 轮询间隔（毫秒），默认 5000 */
  interval?: number;
  /** 最大轮询次数，0 = 不限次数 */
  maxCount?: number;
  /** 是否在挂载后立即执行一次（默认 false，先等一个 interval） */
  immediate?: boolean;
}

/**
 * 轮询 Hook
 * @example
 * const { start, stop } = usePolling(
 *   () => fetchUserList(),
 *   { interval: 3000, maxCount: 5 },
 * );
 */
export function usePolling(
  fetcher: () => Promise<void>,
  options?: UsePollingOptions,
) {
  const ctrlRef = useRef<PollingController | null>(null);
  // 保持 fetcher 引用最新，避免闭包陷阱
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const start = useCallback(() => {
    ctrlRef.current?.stop();
    ctrlRef.current = createPolling({
      fetcher: () => fetcherRef.current(),
      interval: options?.interval,
      maxCount: options?.maxCount,
    });
    ctrlRef.current.start();
  }, [options?.interval, options?.maxCount]);

  const stop = useCallback(() => {
    ctrlRef.current?.stop();
  }, []);

  // 挂载后立即执行
  useEffect(() => {
    if (options?.immediate) {
      fetcherRef.current();
    }
  }, []);

  // 组件卸载时停止轮询
  useEffect(() => {
    return () => {
      ctrlRef.current?.stop();
    };
  }, []);

  return { start, stop };
}
