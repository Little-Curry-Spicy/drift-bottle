import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestWithUserId } from './clerk-auth.guard';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<RequestWithUserId>();
    return req.userId;
  },
);
