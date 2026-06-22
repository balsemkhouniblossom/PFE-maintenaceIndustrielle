import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KPI, KPISchema } from '../schemas/kpi.schema';
import { KpisController } from './kpis.controller';
import { KpisService } from './kpis.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: KPI.name, schema: KPISchema }])],
  controllers: [KpisController],
  providers: [KpisService],
  exports: [KpisService],
})
export class KpisModule {}
