import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePanneDto {
  @IsString()
  @IsNotEmpty()
  panne_id: string;

  @IsString()
  @IsNotEmpty()
  code_panne: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  gravite?: string;
}
