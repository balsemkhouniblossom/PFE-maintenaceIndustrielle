import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateModuleTypeDto {
  @IsString()
  @IsNotEmpty()
  mod_type_id: string;

  @IsString()
  @IsNotEmpty()
  type_id: string;

  @IsString()
  @IsNotEmpty()
  nom_module: string;

  @IsString()
  @IsOptional()
  categorie_module?: string;
}