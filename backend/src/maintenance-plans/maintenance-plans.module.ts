import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaintenancePlan, MaintenancePlanSchema } from '../schemas/maintenance-plan.schema';
import { MaintenancePlansController } from './maintenance-plans.controller';
import { MaintenancePlansService } from './maintenance-plans.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MaintenancePlan.name, schema: MaintenancePlanSchema }]),
  ],
  controllers: [MaintenancePlansController],
  providers: [MaintenancePlansService],
  exports: [MaintenancePlansService],
})
export class MaintenancePlansModule {}
