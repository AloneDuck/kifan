import { LoanStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateLoanDto {
  @IsString()
  name!: string;

  @IsNumberString()
  principalAmount!: string;

  @IsNumberString()
  installmentAmount!: string;

  @IsInt()
  numberOfInstallments!: number;

  @IsDateString()
  startDate!: string;

  @IsInt()
  @Min(1)
  @Max(31)
  monthlyDueDay!: number;

  @IsOptional()
  @IsNumberString()
  interestRate?: string;

  @IsOptional()
  @IsString()
  paymentAccountId?: string;

  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
