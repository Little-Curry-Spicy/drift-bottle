import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = this.messageFromHttpException(exception);
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const body: ApiErrorResponse = {
      success: false,
      code: status,
      message,
      data: null,
    };

    response.status(status).json(body);
  }

  private messageFromHttpException(exception: HttpException): string {
    const res = exception.getResponse();
    if (typeof res === 'string') {
      return res;
    }
    if (typeof res === 'object' && res !== null && 'message' in res) {
      const m = (res as { message: unknown }).message;
      if (typeof m === 'string') return m;
      if (Array.isArray(m)) return m.map(String).join('; ');
    }
    try {
      return JSON.stringify(res);
    } catch {
      return exception.message;
    }
  }
}
