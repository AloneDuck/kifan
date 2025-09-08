import { GoalStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateGoalDto {
  @IsString()
  name!: string;

  @IsNumberString()
  targetAmount!: string;

  @IsOptional()
  @IsNumberString()
  currentAmount?: string;

  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @IsOptional()
  @IsString()
  linkedAccountId?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;
}
