import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  InterventionReport,
  InterventionReportSchema,
} from '../schemas/intervention-report.schema';
import { InterventionReportsController } from './intervention-reports.controller';
import { InterventionReportsService } from './intervention-reports.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InterventionReport.name, schema: InterventionReportSchema },
    ]),
  ],
  controllers: [InterventionReportsController],
  providers: [InterventionReportsService],
  exports: [InterventionReportsService],
})
export class InterventionReportsModule {}
