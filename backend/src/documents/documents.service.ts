import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentEntity, DocumentDocument } from '../schemas/document.schema';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentEntity.name)
    private documentModel: Model<DocumentDocument>,
  ) { }

  async create(dto: CreateDocumentDto) {
    const created = new this.documentModel(dto);
    return created.save();
  }

  async findAll() {
    return this.documentModel.find().exec();
  }
  
  async findOne(id: string) {
    const doc = await this.documentModel.findById(id).populate('machine_id');
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async findByMachine(machineId: string) {
    return this.documentModel
      .find({ machine_id: machineId })
      .populate('machine_id')
      .exec();
  }

  async update(id: string, dto: UpdateDocumentDto) {
    const updated = await this.documentModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!updated) throw new NotFoundException('Document not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.documentModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Document not found');
    return deleted;
  }
}