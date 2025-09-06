import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.asset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const asset = await this.prisma.asset.findFirst({ where: { id, userId } });
    if (!asset) throw new NotFoundException('دارایی پیدا نشد');
    return asset;
  }

  create(userId: string, dto: CreateAssetDto) {
    return this.prisma.asset.create({
      data: {
        userId,
        ...dto,
        acquisitionDate: dto.acquisitionDate
          ? new Date(dto.acquisitionDate)
          : undefined,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateAssetDto) {
    await this.findOne(userId, id);
    return this.prisma.asset.update({
      where: { id },
      data: {
        ...dto,
        acquisitionDate: dto.acquisitionDate
          ? new Date(dto.acquisitionDate)
          : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.asset.delete({ where: { id } });
    return { message: 'دارایی حذف شد' };
  }
}
