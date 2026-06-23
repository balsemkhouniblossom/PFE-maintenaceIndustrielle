import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from '../../schemas/user.schema';

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
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'password must contain upper, lower, and numeric characters',
  })
  password: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsDateString()
  @IsOptional()
  last_login?: string;

  @IsDateString()
  @IsOptional()
  created_at?: string;

  @IsOptional()
  @IsPhoneNumber(undefined)
  phone?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  photo?: string;
}