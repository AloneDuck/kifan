import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

@Injectable()
export class DebtsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.debtRecord.findMany({
      where: { userId },
      include: { person: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const debt = await this.prisma.debtRecord.findFirst({
      where: { id, userId },
    });
    if (!debt) throw new NotFoundException('رکورد بدهی پیدا نشد');
    return debt;
  }

  create(userId: string, dto: CreateDebtDto) {
    return this.prisma.debtRecord.create({
      data: {
        userId,
        personId: dto.personId,
        type: dto.type,
        amount: dto.amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: dto.status,
        settledAmount: dto.settledAmount ?? '0',
        note: dto.note,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateDebtDto) {
    await this.findOne(userId, id);
    return this.prisma.debtRecord.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.debtRecord.delete({ where: { id } });
    return { message: 'رکورد بدهی حذف شد' };
  }
}
