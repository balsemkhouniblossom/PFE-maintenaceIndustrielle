import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateCapteurDto {
  @IsString()
  @IsNotEmpty()
  capteur_id: string;

  @IsString()
  @IsNotEmpty()
  module_id: string;

  @IsString()
  @IsNotEmpty()
  code_capteur: string;

  @IsString()
  @IsNotEmpty()
  type_capteur: string;

  @IsString()
  @IsOptional()
  unite_mesure?: string;

  @IsString()
  @IsOptional()
  mqtt_topic?: string;

  @IsNumber()
  @IsOptional()
  seuil_avertissement?: number;

  @IsNumber()
  @IsOptional()
  seuil_critique?: number;

  @IsNumber()
  @IsOptional()
  frequence_echantillonnage?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsDateString()
  @IsOptional()
  last_seen_at?: string;

  @IsString()
  @IsOptional()
  firmware_version?: string;
}
