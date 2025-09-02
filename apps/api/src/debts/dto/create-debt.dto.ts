import { DebtStatus, DebtType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDebtDto {
  @IsString()
  personId!: string;

  @IsEnum(DebtType)
  type!: DebtType;

  @IsNumberString()
  amount!: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(DebtStatus)
  status?: DebtStatus;

  @IsOptional()
  @IsNumberString()
  settledAmount?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
