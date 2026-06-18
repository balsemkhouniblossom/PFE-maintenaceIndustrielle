import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateMachineDto {
  @IsString()
  @IsNotEmpty()
  machine_id: string;

  @IsString()
  @IsNotEmpty()
  type_id: string;

  @IsString()
  @IsNotEmpty()
  serial_no: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsDateString()
  @IsOptional()
  installation_date?: string;

  @IsNumber()
  @IsOptional()
  poids_kg?: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  // ✅ ADD THESE (this fixes your frontend issue)
  @IsString()
  @IsOptional()
  fabricant?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  location?: string;
}