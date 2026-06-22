import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lubrifiant, LubrifiantDocument } from '../schemas/lubrifiant.schema';

@Injectable()
export class LubrifiantsService {
  constructor(
    @InjectModel(Lubrifiant.name)
    private readonly lubrifiantModel: Model<LubrifiantDocument>,
  ) {}

  create(payload: Record<string, unknown>) {
    return new this.lubrifiantModel(payload).save();
  }

  findAll() {
    return this.lubrifiantModel.find().exec();
  }

  findOne(id: string) {
    return this.lubrifiantModel.findById(id).exec();
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.lubrifiantModel.findByIdAndUpdate(id, payload, { new: true }).exec();
  }

  remove(id: string) {
    return this.lubrifiantModel.findByIdAndDelete(id).exec();
  }
}
