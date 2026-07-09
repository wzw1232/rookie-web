// 统一导出工具函数

import dayjs from 'dayjs';

/**
 * 分 → 元
 * @param cents 金额（分），整数
 * @param decimals 小数位数，默认 2
 * @returns 格式化后的元字符串，如 "123.45"
 * @example centsToYuan(12345) → "123.45"
 */
export function centsToYuan(cents: number, decimals = 2): string {
  return (cents / 100).toFixed(decimals);
}

/**
 * 时间戳转格式化日期字符串
 * @param ts 时间戳（毫秒）或 ISO 字符串
 * @param template dayjs 格式化模板，默认 "YYYY-MM-DD HH:mm:ss"
 * @returns 格式化后的日期字符串
 * @example formatTimestamp(1704067200000) → "2024-01-01 00:00:00"
 */
export function formatTimestamp(
  ts: number | string,
  template = 'YYYY-MM-DD HH:mm:ss',
): string {
  return dayjs(ts).format(template);
}
