import { IsDateString, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInterventionReportDto {
  @IsString()
  @IsNotEmpty()
  report_id: string;

  @IsMongoId()
  ot_id: string;

  @IsMongoId()
  technician_id: string;

  @IsDateString()
  date_debut: string;

  @IsDateString()
  date_fin: string;

  @IsOptional()
  @IsString()
  cause_racine?: string;

  @IsOptional()
  @IsString()
  description_action?: string;

  @IsOptional()
  @IsString()
  etat_final?: string;

  @IsOptional()
  @IsString()
  validation_responsable?: string;
}
