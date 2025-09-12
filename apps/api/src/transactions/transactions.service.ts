import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: {
        account: true,
        toAccount: true,
        category: true,
        person: true,
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        account: true,
        toAccount: true,
        category: true,
        person: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('تراکنش موردنظر پیدا نشد');
    }

    return transaction;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    await this.ensureAccounts(userId, dto.accountId, dto.toAccountId, dto.type);

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: dto.type,
          amount: dto.amount,
          date: new Date(dto.date),
          accountId: dto.accountId,
          toAccountId: dto.toAccountId,
          categoryId: dto.categoryId,
          personId: dto.personId,
          description: dto.description,
          notes: dto.notes,
          tags: dto.tags ?? [],
        },
      });

      await this.applyAccountEffect(
        tx,
        dto.type,
        dto.accountId,
        dto.amount,
        dto.toAccountId,
      );
      return transaction;
    });
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.findOne(userId, id);
    const nextType = dto.type ?? existing.type;
    const nextAccountId = dto.accountId ?? existing.accountId;
    const nextToAccountId =
      dto.toAccountId ?? existing.toAccountId ?? undefined;
    const nextAmount = dto.amount ?? existing.amount.toString();

    await this.ensureAccounts(userId, nextAccountId, nextToAccountId, nextType);

    return this.prisma.$transaction(async (tx) => {
      await this.revertAccountEffect(
        tx,
        existing.type,
        existing.accountId,
        existing.amount.toString(),
        existing.toAccountId ?? undefined,
      );

      const updated = await tx.transaction.update({
        where: { id },
        data: {
          ...dto,
          date: dto.date ? new Date(dto.date) : undefined,
          tags: dto.tags,
        },
      });

      await this.applyAccountEffect(
        tx,
        nextType,
        nextAccountId,
        nextAmount,
        nextToAccountId,
      );
      return updated;
    });
  }

  async remove(userId: string, id: string) {
    const existing = await this.findOne(userId, id);

    await this.prisma.$transaction(async (tx) => {
      await this.revertAccountEffect(
        tx,
        existing.type,
        existing.accountId,
        existing.amount.toString(),
        existing.toAccountId ?? undefined,
      );
      await tx.transaction.delete({ where: { id } });
    });

    return { message: 'تراکنش با موفقیت حذف شد' };
  }

  private async ensureAccounts(
    userId: string,
    accountId: string,
    toAccountId: string | undefined,
    type: TransactionType,
  ) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) {
      throw new BadRequestException('حساب اصلی معتبر نیست');
    }

    if (type === TransactionType.TRANSFER) {
      if (!toAccountId) {
        throw new BadRequestException('برای انتقال باید حساب مقصد انتخاب شود');
      }

      const target = await this.prisma.account.findFirst({
        where: { id: toAccountId, userId },
      });
      if (!target) {
        throw new BadRequestException('حساب مقصد معتبر نیست');
      }
    }
  }

  private async applyAccountEffect(
    tx: Prisma.TransactionClient,
    type: TransactionType,
    accountId: string,
    amount: string,
    toAccountId?: string,
  ) {
    const value = Number(amount);

    if (type === TransactionType.INCOME) {
      await tx.account.update({
        where: { id: accountId },
        data: { currentBalance: { increment: value } },
      });
      return;
    }

    if (type === TransactionType.EXPENSE) {
      await tx.account.update({
        where: { id: accountId },
        data: { currentBalance: { decrement: value } },
      });
      return;
    }

    await tx.account.update({
      where: { id: accountId },
      data: { currentBalance: { decrement: value } },
    });
    if (toAccountId) {
      await tx.account.update({
        where: { id: toAccountId },
        data: { currentBalance: { increment: value } },
      });
    }
  }

  private async revertAccountEffect(
    tx: Prisma.TransactionClient,
    type: TransactionType,
    accountId: string,
    amount: string,
    toAccountId?: string,
  ) {
    const inverseType =
      type === TransactionType.INCOME
        ? TransactionType.EXPENSE
        : type === TransactionType.EXPENSE
          ? TransactionType.INCOME
          : TransactionType.TRANSFER;

    if (type === TransactionType.TRANSFER) {
      const value = Number(amount);
      await tx.account.update({
        where: { id: accountId },
        data: { currentBalance: { increment: value } },
      });
      if (toAccountId) {
        await tx.account.update({
          where: { id: toAccountId },
          data: { currentBalance: { decrement: value } },
        });
      }
      return;
    }

    await this.applyAccountEffect(tx, inverseType, accountId, amount);
  }
}
