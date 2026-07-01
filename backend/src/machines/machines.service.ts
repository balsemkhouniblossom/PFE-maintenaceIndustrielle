import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Machine, MachineDocument } from '../schemas/machine.schema';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { PaginatedResponse, toPaginatedResponse } from '../common/pagination';

@Injectable()
export class MachinesService {
  constructor(
    @InjectModel(Machine.name) private machineModel: Model<MachineDocument>,
  ) {}

  async create(createMachineDto: CreateMachineDto): Promise<Machine> {
    const createdMachine = new this.machineModel(createMachineDto);
    return createdMachine.save();
  }

  async countAll(): Promise<number> {
    return this.machineModel.countDocuments().exec();
  }

  async findAll(
    page: number,
    limit: number,
    skip: number,
  ): Promise<PaginatedResponse<Machine>> {
    const [items, totalItems] = await Promise.all([
      this.machineModel.find().skip(skip).limit(limit).exec(),
      this.machineModel.countDocuments().exec(),
    ]);

    return toPaginatedResponse(items, totalItems, page, limit);
  }

  async findOne(id: string): Promise<any> {
    return this.machineModel.findById(id).exec();
  }

  async update(id: string, updateMachineDto: UpdateMachineDto): Promise<any> {
    return this.machineModel
      .findByIdAndUpdate(id, updateMachineDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<any> {
    return this.machineModel.findByIdAndDelete(id).exec();
  }
}
