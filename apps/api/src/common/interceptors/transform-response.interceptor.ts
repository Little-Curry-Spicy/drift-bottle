import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SKIP_TRANSFORM_KEY } from '../decorators/skip-transform.decorator';
import type { ApiSuccessResponse } from '../interfaces/api-response.interface';

function isAlreadySuccessEnvelope(data: unknown): data is ApiSuccessResponse {
  if (data === null || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    d.success === true &&
    d.code === 0 &&
    typeof d.message === 'string' &&
    'data' in d
  );
}

/**
 * 将所有正常返回包成统一结构：{ success, code, message, data }。
 * 注意：流式响应、@Res() 手动接管响应时请勿依赖此拦截器。
 */
@Injectable()
export class TransformResponseInterceptor implements NestInterceptor<
  unknown,
  ApiSuccessResponse
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TRANSFORM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) {
      return next.handle() as Observable<ApiSuccessResponse>;
    }
    return next.handle().pipe(
      map((data: unknown): ApiSuccessResponse => {
        if (isAlreadySuccessEnvelope(data)) {
          return data;
        }
        return {
          success: true,
          code: 0,
          message: 'OK',
          data: data === undefined ? null : data,
        };
      }),
    );
  }
}
