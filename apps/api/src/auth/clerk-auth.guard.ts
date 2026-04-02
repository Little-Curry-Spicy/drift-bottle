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

    if (secret && auth?.startsWith('Bearer ')) {
      const token = auth.slice(7);
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

    if (this.config.get<string>('AUTH_DEV_USER_HEADER') === 'true') {
      const raw = req.headers['x-user-id'];
      const id = Array.isArray(raw) ? raw[0] : raw;
      if (typeof id === 'string' && id.length > 0) {
        req.userId = id;
        return true;
      }
    }

    throw new UnauthorizedException(
      'Provide Authorization: Bearer <Clerk JWT>, or set AUTH_DEV_USER_HEADER=true and X-User-Id for local dev',
    );
  }
}
