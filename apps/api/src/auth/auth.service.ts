import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { CurrentUser } from '../common/interfaces/current-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new UnauthorizedException('این ایمیل قبلا ثبت شده است');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email.toLowerCase(),
        passwordHash,
        preferredCurrency: dto.preferredCurrency,
        settings: {
          create: {
            currency: dto.preferredCurrency,
          },
        },
      },
    });

    return this.issueTokens(
      { sub: user.id, email: user.email },
      {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        preferredCurrency: user.preferredCurrency,
      },
    );
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('ایمیل یا رمز عبور نادرست است');
    }

    return this.issueTokens(
      { sub: user.id, email: user.email },
      {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        preferredCurrency: user.preferredCurrency,
      },
    );
  }

  async refresh(refreshToken: string) {
    const storedTokens = await this.prisma.refreshToken.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    const matched = await this.findMatchingRefreshToken(
      storedTokens,
      refreshToken,
    );
    if (!matched?.user) {
      throw new UnauthorizedException('توکن تمدید معتبر نیست');
    }

    return this.issueTokens(
      { sub: matched.user.id, email: matched.user.email },
      {
        id: matched.user.id,
        fullName: matched.user.fullName,
        email: matched.user.email,
        preferredCurrency: matched.user.preferredCurrency,
      },
      matched.id,
    );
  }

  async logout(refreshToken: string) {
    const storedTokens = await this.prisma.refreshToken.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const matched = await this.findMatchingRefreshToken(
      storedTokens,
      refreshToken,
    );

    if (matched) {
      await this.prisma.refreshToken.delete({ where: { id: matched.id } });
    }

    return {
      message: 'خروج با موفقیت انجام شد',
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      preferredCurrency: user.preferredCurrency,
    };
  }

  private async issueTokens(
    payload: CurrentUser,
    user: {
      id: string;
      fullName: string;
      email: string;
      preferredCurrency: string;
    },
    replaceTokenId?: string,
  ) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'change-me-access',
      expiresIn: '1d',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh',
      expiresIn: '30d',
    });

    if (replaceTokenId) {
      await this.prisma.refreshToken.delete({ where: { id: replaceTokenId } });
    }

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await argon2.hash(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  private async findMatchingRefreshToken(
    tokens: Array<{
      id: string;
      tokenHash: string;
      expiresAt: Date;
      user?: {
        id: string;
        fullName: string;
        email: string;
        preferredCurrency: string;
      };
    }>,
    refreshToken: string,
  ) {
    for (const token of tokens) {
      if (token.expiresAt < new Date()) {
        continue;
      }

      if (await argon2.verify(token.tokenHash, refreshToken)) {
        return token;
      }
    }

    return null;
  }
}
