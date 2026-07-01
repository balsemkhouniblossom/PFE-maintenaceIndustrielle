import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Module as ModuleEntity,
  ModuleDocument,
} from '../schemas/module.schema';
import { PaginatedResponse, toPaginatedResponse } from '../common/pagination';

@Injectable()
export class ModulesService {
  constructor(
    @InjectModel(ModuleEntity.name)
    private readonly moduleModel: Model<ModuleDocument>,
  ) {}

  create(payload: Record<string, unknown>) {
    return new this.moduleModel(payload).save();
  }

  async findAll(
    page: number,
    limit: number,
    skip: number,
  ): Promise<PaginatedResponse<ModuleEntity>> {
    const [items, totalItems] = await Promise.all([
      this.moduleModel
        .find()
        .skip(skip)
        .limit(limit)
        .populate('machine_id')
        .populate('mod_type_id')
        .populate('parent_module_id')
        .exec(),
      this.moduleModel.countDocuments().exec(),
    ]);

    return toPaginatedResponse(items, totalItems, page, limit);
  }

  findOne(id: string) {
    return this.moduleModel
      .findById(id)
      .populate('machine_id')
      .populate('mod_type_id')
      .populate('parent_module_id')
      .exec();
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.moduleModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();
  }

  remove(id: string) {
    return this.moduleModel.findByIdAndDelete(id).exec();
  }
}
