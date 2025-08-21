import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { CurrentUser } from '../interfaces/current-user.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: CurrentUser;
    }>();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('نشست کاربر معتبر نیست');
    }

    try {
      request.user = this.jwtService.verify<CurrentUser>(token, {
        secret: process.env.JWT_ACCESS_SECRET ?? 'change-me-access',
      });
      return true;
    } catch {
      throw new UnauthorizedException('توکن دسترسی معتبر نیست');
    }
  }
}
