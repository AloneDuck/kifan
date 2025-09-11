import { Injectable, NotFoundException } from '@nestjs/common';
import { InstallmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.loan.findMany({
      where: { userId },
      include: { installments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const loan = await this.prisma.loan.findFirst({
      where: { id, userId },
      include: { installments: true },
    });
    if (!loan) throw new NotFoundException('وام پیدا نشد');
    return loan;
  }

  async create(userId: string, dto: CreateLoanDto) {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          userId,
          name: dto.name,
          principalAmount: dto.principalAmount,
          installmentAmount: dto.installmentAmount,
          numberOfInstallments: dto.numberOfInstallments,
          startDate: new Date(dto.startDate),
          monthlyDueDay: dto.monthlyDueDay,
          interestRate: dto.interestRate,
          paymentAccountId: dto.paymentAccountId,
          status: dto.status,
          notes: dto.notes,
        },
      });

      await tx.loanInstallment.createMany({
        data: Array.from({ length: dto.numberOfInstallments }).map(
          (_, index) => {
            const dueDate = new Date(dto.startDate);
            dueDate.setMonth(dueDate.getMonth() + index);
            dueDate.setDate(dto.monthlyDueDay);
            return {
              userId,
              loanId: loan.id,
              installmentNumber: index + 1,
              dueDate,
              amount: dto.installmentAmount,
              status: InstallmentStatus.UNPAID,
            };
          },
        ),
      });

      return tx.loan.findUniqueOrThrow({
        where: { id: loan.id },
        include: { installments: true },
      });
    });
  }

  async update(userId: string, id: string, dto: UpdateLoanDto) {
    await this.findOne(userId, id);
    return this.prisma.loan.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.loan.delete({ where: { id } });
    return { message: 'وام حذف شد' };
  }

  async payInstallment(userId: string, installmentId: string) {
    const installment = await this.prisma.loanInstallment.findFirst({
      where: { id: installmentId, userId },
    });
    if (!installment) throw new NotFoundException('قسط موردنظر پیدا نشد');
    return this.prisma.loanInstallment.update({
      where: { id: installmentId },
      data: { status: InstallmentStatus.PAID, paidDate: new Date() },
    });
  }
}
