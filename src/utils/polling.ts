// 轮询工具——支持按次数或无限轮询，随时启停

export interface PollingOptions {
  /** 每次轮询执行的异步函数 */
  fetcher: () => Promise<void>;
  /** 轮询间隔（毫秒），默认 5000 */
  interval?: number;
  /** 最大轮询次数，0 = 不限次数 */
  maxCount?: number;
  /** 每次轮询后的回调，参数为当前已轮询次数 */
  onPoll?: (count: number) => void;
  /** 错误处理回调 */
  onError?: (error: Error) => void;
}

export interface PollingController {
  /** 开始轮询（重复调用会先停止上一次） */
  start: () => void;
  /** 停止轮询 */
  stop: () => void;
  /** 是否正在轮询 */
  isRunning: () => boolean;
}

/**
 * 创建一个轮询控制器
 * @example
 * const polling = createPolling({
 *   fetcher: () => fetchStatus(),
 *   interval: 3000,
 *   maxCount: 10, // 轮询10次后自动停止；0表示不限次数
 * });
 * polling.start();
 * // ... 需要停止时：
 * polling.stop();
 */
export function createPolling(options: PollingOptions): PollingController {
  const {
    fetcher,
    interval = 5000,
    maxCount = 0,
    onPoll,
    onError,
  } = options;

  let timer: ReturnType<typeof setInterval> | null = null;
  let count = 0;

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  const start = () => {
    // 先停止上一次轮询
    stop();
    count = 0;

    const run = async () => {
      try {
        await fetcher();
        count += 1;
        onPoll?.(count);

        if (maxCount > 0 && count >= maxCount) {
          stop();
        }
      } catch (err) {
        onError?.(err as Error);
      }
    };

    timer = setInterval(run, interval);
  };

  const isRunning = () => timer !== null;

  return { start, stop, isRunning };
}
