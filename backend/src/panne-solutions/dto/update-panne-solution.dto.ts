import { PartialType } from '@nestjs/mapped-types';
import { CreatePanneSolutionDto } from './create-panne-solution.dto';

export class UpdatePanneSolutionDto extends PartialType(
  CreatePanneSolutionDto,
) {}
