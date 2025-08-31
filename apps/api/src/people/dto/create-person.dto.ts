import { IsOptional, IsString } from 'class-validator';

export class CreatePersonDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
