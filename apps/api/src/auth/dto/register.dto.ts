import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export enum PreferredCurrency {
  TOMAN = 'TOMAN',
  RIAL = 'RIAL',
}

export class RegisterDto {
  @IsString()
  @MinLength(3)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(PreferredCurrency)
  preferredCurrency: PreferredCurrency = PreferredCurrency.TOMAN;
}
