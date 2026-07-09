// 全局类型声明

declare namespace API {
  /** 用户信息 */
  interface UserInfo {
    id: number;
    username: string;
    name: string;
    avatar: string;
    role: 'admin' | 'editor' | 'viewer';
    permissions: string[];
  }

  /** getInitialState 返回的全局初始化状态 */
  interface InitialState {
    currentUser?: UserInfo;
    permissions: string[];
    token: string | null;
  }

  /** 后端统一响应格式 */
  interface ApiResponse<T = any> {
    success: boolean;
    code: number;
    msg: string;
    data: T;
  }

  /** 分页查询参数 */
  interface PageParams {
    current?: number;
    pageSize?: number;
    [key: string]: any;
  }

  /** 分页查询结果 */
  interface PageResult<T> {
    list: T[];
    total: number;
  }

  /** 上传结果 */
  interface UploadResult {
    url: string;
    filename: string;
    size?: number;
  }

  /** OSS 临时凭证 */
  interface OSSCredentials {
    accessKeyId: string;
    accessKeySecret: string;
    stsToken: string;
    region: string;
    bucket: string;
    endpoint?: string;
  }
}

/** 环境变量类型 */
declare const API_HOST: string | undefined;

/** less 模块声明 */
declare module '*.less' {
  const styles: Record<string, string>;
  export default styles;
}
