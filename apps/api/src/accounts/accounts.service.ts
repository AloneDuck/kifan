import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
    });
    if (!account) {
      throw new NotFoundException('حساب موردنظر پیدا نشد');
    }
    return account;
  }

  create(userId: string, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        initialBalance: dto.initialBalance,
        currentBalance: dto.initialBalance,
        currency: dto.currency,
        color: dto.color,
        icon: dto.icon,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateAccountDto) {
    await this.findOne(userId, id);
    return this.prisma.account.update({
      where: { id },
      data: dto.initialBalance
        ? { ...dto, currentBalance: dto.initialBalance }
        : dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.account.delete({ where: { id } });
    return { message: 'حساب با موفقیت حذف شد' };
  }
}
