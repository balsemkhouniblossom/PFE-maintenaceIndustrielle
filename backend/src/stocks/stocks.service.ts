import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stock, StockDocument } from '../schemas/stock.schema';
import { PaginatedResponse, toPaginatedResponse } from '../common/pagination';

@Injectable()
export class StocksService {
  constructor(
    @InjectModel(Stock.name) private readonly stockModel: Model<StockDocument>,
  ) {}

  create(payload: Record<string, unknown>) {
    return new this.stockModel(payload).save();
  }

  async findAll(
    page: number,
    limit: number,
    skip: number,
  ): Promise<PaginatedResponse<Stock>> {
    const [items, totalItems] = await Promise.all([
      this.stockModel.find().skip(skip).limit(limit).populate('part_id').exec(),
      this.stockModel.countDocuments().exec(),
    ]);

    return toPaginatedResponse(items, totalItems, page, limit);
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
