// 全局常量

/**
 * 应用名称 — 单一来源：package.json 的 name 字段
 * 所有页面标题、Footer、水印等统一引用此常量，
 * 修改应用名只需改 package.json 的 name 即可。
 */
import pkg from '../../package.json';
export const APP_NAME: string = pkg.name;

/** 权限标识 */
export const PERMISSIONS = {
  HOME: 'home',
  ACCESS_READ: 'access:read',
  DEMO: 'demo',
  DEMO_UPLOAD: 'demo:upload',
  DEMO_COMPONENTS: 'demo:components',
} as const;

/** 按钮级别权限标识 */
export const BUTTON_PERMISSIONS = {
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
} as const;

/** 上传配置默认值 */
export const UPLOAD_DEFAULTS = {
  /** 图片最大数量 */
  IMAGE_MAX_COUNT: 5,
  /** 图片最大大小 (MB) */
  IMAGE_MAX_SIZE: 10,
  /** 图片允许的类型 */
  IMAGE_ACCEPT: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'] as string[],
  /** 文件最大数量 */
  FILE_MAX_COUNT: 10,
  /** 文件最大大小 (MB) */
  FILE_MAX_SIZE: 50,
  /** 并发上传数 */
  CONCURRENCY: 2,
} as const;

/** 状态映射 */
export const STATUS_MAP: Record<number, string> = {
  1: '无敌小子',
};
