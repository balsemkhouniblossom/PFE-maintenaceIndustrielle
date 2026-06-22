import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KPI, KPIDocument } from '../schemas/kpi.schema';

@Injectable()
export class KpisService {
  constructor(@InjectModel(KPI.name) private readonly kpiModel: Model<KPIDocument>) {}

  create(payload: Record<string, unknown>) {
    return new this.kpiModel(payload).save();
  }

  findAll() {
    return this.kpiModel.find().populate('machine_id').exec();
  }

  findOne(id: string) {
    return this.kpiModel.findById(id).populate('machine_id').exec();
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.kpiModel.findByIdAndUpdate(id, payload, { new: true }).exec();
  }

  remove(id: string) {
    return this.kpiModel.findByIdAndDelete(id).exec();
  }
}
