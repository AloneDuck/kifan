import { CheckStatus, CheckType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCheckDto {
  @IsEnum(CheckType)
  type!: CheckType;

  @IsNumberString()
  amount!: string;

  @IsString()
  checkNumber!: string;

  @IsString()
  bankName!: string;

  @IsOptional()
  @IsString()
  personId?: string;

  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsEnum(CheckStatus)
  status?: CheckStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
