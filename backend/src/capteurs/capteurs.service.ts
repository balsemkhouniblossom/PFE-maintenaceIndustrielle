import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Capteur, CapteurDocument } from '../schemas/capteur.schema';
import { CreateCapteurDto } from './dto/create-capteur.dto';
import { UpdateCapteurDto } from './dto/update-capteur.dto';

@Injectable()
export class CapteursService {
  constructor(
    @InjectModel(Capteur.name) private capteurModel: Model<CapteurDocument>,
  ) {}

  async findAll(): Promise<Capteur[]> {
    return this.capteurModel.find().exec();
  }

  async findOne(id: string): Promise<Capteur | null> {
    return this.capteurModel.findById(id).exec();
  }

  async create(createCapteurDto: CreateCapteurDto): Promise<Capteur> {
    const newCapteur = new this.capteurModel(createCapteurDto);
    return newCapteur.save();
  }

  async update(id: string, updateCapteurDto: UpdateCapteurDto): Promise<Capteur | null> {
    return this.capteurModel.findByIdAndUpdate(id, updateCapteurDto, { new: true }).exec();
  }

  async delete(id: string): Promise<Capteur | null> {
    return this.capteurModel.findByIdAndDelete(id).exec();
  }
}
