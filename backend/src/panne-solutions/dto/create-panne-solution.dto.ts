import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePanneSolutionDto {
  @IsString()
  @IsNotEmpty()
  solution_id: string;

  @IsMongoId()
  panne_id: string;

  @IsOptional()
  @IsString()
  cause_probable?: string;

  @IsOptional()
  @IsString()
  solution_recommandee?: string;
}
