import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckDto } from './dto/create-check.dto';
import { UpdateCheckDto } from './dto/update-check.dto';

@Injectable()
export class ChecksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.check.findMany({
      where: { userId },
      include: { person: true },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const record = await this.prisma.check.findFirst({ where: { id, userId } });
    if (!record) throw new NotFoundException('چک موردنظر پیدا نشد');
    return record;
  }

  create(userId: string, dto: CreateCheckDto) {
    return this.prisma.check.create({
      data: {
        userId,
        type: dto.type,
        amount: dto.amount,
        checkNumber: dto.checkNumber,
        bankName: dto.bankName,
        personId: dto.personId,
        dueDate: new Date(dto.dueDate),
        status: dto.status,
        note: dto.note,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateCheckDto) {
    await this.findOne(userId, id);
    return this.prisma.check.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.check.delete({ where: { id } });
    return { message: 'چک حذف شد' };
  }
}
