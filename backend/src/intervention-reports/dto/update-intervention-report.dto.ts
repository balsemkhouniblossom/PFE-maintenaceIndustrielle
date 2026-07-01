import { PartialType } from '@nestjs/mapped-types';
import { CreateInterventionReportDto } from './create-intervention-report.dto';

export class UpdateInterventionReportDto extends PartialType(
  CreateInterventionReportDto,
) {}
