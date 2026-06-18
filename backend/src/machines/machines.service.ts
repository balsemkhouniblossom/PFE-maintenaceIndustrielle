import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Machine, MachineDocument } from '../schemas/machine.schema';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';

@Injectable()
export class MachinesService {
  constructor(
    @InjectModel(Machine.name) private machineModel: Model<MachineDocument>,
  ) {}

  async create(createMachineDto: CreateMachineDto): Promise<Machine> {
    const createdMachine = new this.machineModel(createMachineDto);
    return createdMachine.save();
  }

  async findAll(): Promise<Machine[]> {
    return this.machineModel.find().exec();
  }

  async findOne(id: string): Promise<any> {
    return this.machineModel.findById(id).exec();
  }

  async update(id: string, updateMachineDto: UpdateMachineDto): Promise<any> {
    return this.machineModel.findByIdAndUpdate(id, updateMachineDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    return this.machineModel.findByIdAndDelete(id).exec();
  }
}