import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import type { Request } from 'express';

export type RequestWithUserId = Request & { userId: string };

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUserId>();
    const secret = this.config.get<string>('CLERK_SECRET_KEY');
    const auth = req.headers.authorization;
    const q = req.query?.token;
    const tokenFromQuery =
      typeof q === 'string'
        ? q
        : Array.isArray(q) && typeof q[0] === 'string'
          ? q[0]
          : undefined;

    const token: string | undefined = auth?.startsWith('Bearer ')
      ? auth.slice(7)
      : tokenFromQuery;

    if (secret && token) {
      try {
        const payload = await verifyToken(token, { secretKey: secret });
        if (!payload.sub) {
          throw new UnauthorizedException('Invalid token');
        }
        req.userId = payload.sub;
        return true;
      } catch {
        throw new UnauthorizedException('Invalid or expired token');
      }
    }

    throw new UnauthorizedException(
      'Provide Authorization: Bearer <Clerk JWT> or ?token= (SSE / EventSource)',
    );
  }
}
