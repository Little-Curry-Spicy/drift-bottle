/** 成功响应统一外壳（由 TransformResponseInterceptor 注入） */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  /** 业务码：成功固定为 0 */
  code: 0;
  message: string;
  data: T | null;
}

/** 失败响应统一外壳（由 AllExceptionsFilter 注入） */
export interface ApiErrorResponse {
  success: false;
  /** 与 HTTP 状态码一致，便于排查 */
  code: number;
  message: string;
  data: null;
}
