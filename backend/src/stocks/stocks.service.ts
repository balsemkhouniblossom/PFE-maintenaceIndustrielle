import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stock, StockDocument } from '../schemas/stock.schema';

@Injectable()
export class StocksService {
  constructor(@InjectModel(Stock.name) private readonly stockModel: Model<StockDocument>) {}

  create(payload: Record<string, unknown>) {
    return new this.stockModel(payload).save();
  }

  findAll() {
    return this.stockModel.find().populate('part_id').exec();
  }

  findOne(id: string) {
    return this.stockModel.findById(id).populate('part_id').exec();
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.stockModel.findByIdAndUpdate(id, payload, { new: true }).exec();
  }

  remove(id: string) {
    return this.stockModel.findByIdAndDelete(id).exec();
  }
}
