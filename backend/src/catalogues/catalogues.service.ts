import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Catalogue, CatalogueDocument } from '../schemas/catalogue.schema';
import { CreateCatalogueDto } from './dto/create-catalogue.dto';
import { UpdateCatalogueDto } from './dto/update-catalogue.dto';

@Injectable()
export class CataloguesService {
  constructor(
    @InjectModel(Catalogue.name) private catalogueModel: Model<CatalogueDocument>,
  ) {}

  async create(createCatalogueDto: CreateCatalogueDto): Promise<Catalogue> {
    const createdCatalogue = new this.catalogueModel(createCatalogueDto);
    return createdCatalogue.save();
  }

  async findAll(): Promise<Catalogue[]> {
    return this.catalogueModel.find().exec();
  }

  async findOne(id: string): Promise<any> {
    return this.catalogueModel.findById(id).exec();
  }

  async update(id: string, updateCatalogueDto: UpdateCatalogueDto): Promise<any> {
    return this.catalogueModel.findByIdAndUpdate(id, updateCatalogueDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    return this.catalogueModel.findByIdAndDelete(id).exec();
  }
}