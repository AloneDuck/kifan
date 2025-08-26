import { AccountType, Currency } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAccountDto {
  @IsString()
  name!: string;

  @IsEnum(AccountType)
  type!: AccountType;

  @IsNumberString()
  initialBalance!: string;

  @IsEnum(Currency)
  currency: Currency = Currency.TOMAN;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
