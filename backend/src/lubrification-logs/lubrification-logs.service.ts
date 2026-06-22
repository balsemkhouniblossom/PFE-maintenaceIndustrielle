import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LubrificationLog, LubrificationLogDocument } from '../schemas/lubrification-log.schema';

@Injectable()
export class LubrificationLogsService {
  constructor(
    @InjectModel(LubrificationLog.name)
    private readonly lubrificationLogModel: Model<LubrificationLogDocument>,
  ) {}

  create(payload: Record<string, unknown>) {
    return new this.lubrificationLogModel(payload).save();
  }

  findAll() {
    return this.lubrificationLogModel
      .find()
      .populate('module_id')
      .populate('lubrifiant_id')
      .populate('technician_id')
      .exec();
  }

  findOne(id: string) {
    return this.lubrificationLogModel
      .findById(id)
      .populate('module_id')
      .populate('lubrifiant_id')
      .populate('technician_id')
      .exec();
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.lubrificationLogModel.findByIdAndUpdate(id, payload, { new: true }).exec();
  }

  remove(id: string) {
    return this.lubrificationLogModel.findByIdAndDelete(id).exec();
  }
}
