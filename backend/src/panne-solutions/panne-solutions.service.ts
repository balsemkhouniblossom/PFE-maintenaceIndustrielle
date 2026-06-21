import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PanneSolution, PanneSolutionDocument } from '../schemas/panne-solution.schema';
import { CreatePanneSolutionDto } from './dto/create-panne-solution.dto';
import { UpdatePanneSolutionDto } from './dto/update-panne-solution.dto';

@Injectable()
export class PanneSolutionsService {
  constructor(
    @InjectModel(PanneSolution.name)
    private panneSolutionModel: Model<PanneSolutionDocument>,
  ) {}

  async create(createPanneSolutionDto: CreatePanneSolutionDto): Promise<PanneSolution> {
    const createdPanneSolution = new this.panneSolutionModel(createPanneSolutionDto);
    return createdPanneSolution.save();
  }

  async findAll(): Promise<PanneSolution[]> {
    return this.panneSolutionModel.find().populate('panne_id').exec();
  }

  async findOne(id: string): Promise<PanneSolution | null> {
    return this.panneSolutionModel.findById(id).populate('panne_id').exec();
  }

  async update(id: string, updatePanneSolutionDto: UpdatePanneSolutionDto): Promise<PanneSolution | null> {
    return this.panneSolutionModel
      .findByIdAndUpdate(id, updatePanneSolutionDto, { new: true })
      .populate('panne_id')
      .exec();
  }

  async remove(id: string): Promise<PanneSolution | null> {
    return this.panneSolutionModel.findByIdAndDelete(id).exec();
  }
}
