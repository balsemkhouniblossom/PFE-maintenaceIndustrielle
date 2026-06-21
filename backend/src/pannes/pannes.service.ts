import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Panne, PanneDocument } from '../schemas/panne.schema';
import { CreatePanneDto } from './dto/create-panne.dto';
import { UpdatePanneDto } from './dto/update-panne.dto';

@Injectable()
export class PannesService {
  constructor(
    @InjectModel(Panne.name)
    private panneModel: Model<PanneDocument>,
  ) {}

  async create(createPanneDto: CreatePanneDto): Promise<Panne> {
    const createdPanne = new this.panneModel(createPanneDto);
    return createdPanne.save();
  }

  async findAll(): Promise<Panne[]> {
    return this.panneModel.find().exec();
  }

  async findOne(id: string): Promise<Panne | null> {
    return this.panneModel.findById(id).exec();
  }

  async update(id: string, updatePanneDto: UpdatePanneDto): Promise<Panne | null> {
    return this.panneModel.findByIdAndUpdate(id, updatePanneDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Panne | null> {
    return this.panneModel.findByIdAndDelete(id).exec();
  }
}
