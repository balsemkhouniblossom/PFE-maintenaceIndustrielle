import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MaintenancePlan, MaintenancePlanDocument } from '../schemas/maintenance-plan.schema';

@Injectable()
export class MaintenancePlansService {
  constructor(
    @InjectModel(MaintenancePlan.name)
    private readonly maintenancePlanModel: Model<MaintenancePlanDocument>,
  ) {}

  create(payload: Record<string, unknown>) {
    return new this.maintenancePlanModel(payload).save();
  }

  findAll() {
    return this.maintenancePlanModel.find().populate('module_id').exec();
  }

  findOne(id: string) {
    return this.maintenancePlanModel.findById(id).populate('module_id').exec();
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.maintenancePlanModel.findByIdAndUpdate(id, payload, { new: true }).exec();
  }

  remove(id: string) {
    return this.maintenancePlanModel.findByIdAndDelete(id).exec();
  }
}
