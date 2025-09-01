import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PeopleService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.person.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const person = await this.prisma.person.findFirst({
      where: { id, userId },
    });
    if (!person) throw new NotFoundException('فرد موردنظر پیدا نشد');
    return person;
  }

  create(userId: string, dto: CreatePersonDto) {
    return this.prisma.person.create({ data: { userId, ...dto } });
  }

  async update(userId: string, id: string, dto: UpdatePersonDto) {
    await this.findOne(userId, id);
    return this.prisma.person.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.person.delete({ where: { id } });
    return { message: 'فرد با موفقیت حذف شد' };
  }
}
