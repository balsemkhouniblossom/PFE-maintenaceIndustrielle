import { IsNotEmpty, IsString, IsEmail, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional() // Made optional since it will be auto-generated
  user_id?: string;

  @IsString()
  @IsNotEmpty()
  nom_complet: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsDateString()
  @IsOptional()
  last_login?: string;

  @IsDateString()
  @IsOptional()
  created_at?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  photo?: string;
}