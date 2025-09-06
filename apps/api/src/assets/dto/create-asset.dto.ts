import { AssetType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAssetDto {
  @IsEnum(AssetType)
  type!: AssetType;

  @IsString()
  name!: string;

  @IsNumberString()
  quantity!: string;

  @IsString()
  unit!: string;

  @IsNumberString()
  unitValue!: string;

  @IsNumberString()
  totalValue!: string;

  @IsOptional()
  @IsDateString()
  acquisitionDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
