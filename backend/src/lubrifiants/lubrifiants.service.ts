import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lubrifiant, LubrifiantDocument } from '../schemas/lubrifiant.schema';
import { PaginatedResponse, toPaginatedResponse } from '../common/pagination';

@Injectable()
export class LubrifiantsService {
  constructor(
    @InjectModel(Lubrifiant.name)
    private readonly lubrifiantModel: Model<LubrifiantDocument>,
  ) {}

  create(payload: Record<string, unknown>) {
    return new this.lubrifiantModel(payload).save();
  }

  async findAll(
    page: number,
    limit: number,
    skip: number,
  ): Promise<PaginatedResponse<Lubrifiant>> {
    const [items, totalItems] = await Promise.all([
      this.lubrifiantModel.find().skip(skip).limit(limit).exec(),
      this.lubrifiantModel.countDocuments().exec(),
    ]);

    return toPaginatedResponse(items, totalItems, page, limit);
  }

  findOne(id: string) {
    return this.lubrifiantModel.findById(id).exec();
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.lubrifiantModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();
  }

  remove(id: string) {
    return this.lubrifiantModel.findByIdAndDelete(id).exec();
  }
}
