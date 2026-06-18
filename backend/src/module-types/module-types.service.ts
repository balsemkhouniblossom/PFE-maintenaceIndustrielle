import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModuleType, ModuleTypeDocument } from '../schemas/module-type.schema';
import { CreateModuleTypeDto } from './dto/create-module-type.dto';
import { UpdateModuleTypeDto } from './dto/update-module-type.dto';

@Injectable()
export class ModuleTypesService {
  constructor(
    @InjectModel(ModuleType.name) private moduleTypeModel: Model<ModuleTypeDocument>,
  ) {}

  async create(createModuleTypeDto: CreateModuleTypeDto): Promise<ModuleType> {
    const createdModuleType = new this.moduleTypeModel(createModuleTypeDto);
    return createdModuleType.save();
  }

  async findAll(): Promise<ModuleType[]> {
    return this.moduleTypeModel.find().exec();
  }

  async findOne(id: string): Promise<any> {
    return this.moduleTypeModel.findById(id).exec();
  }

  async update(id: string, updateModuleTypeDto: UpdateModuleTypeDto): Promise<any> {
    return this.moduleTypeModel.findByIdAndUpdate(id, updateModuleTypeDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    return this.moduleTypeModel.findByIdAndDelete(id).exec();
  }
}