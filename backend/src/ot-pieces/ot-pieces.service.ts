import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OTPieces, OTPiecesDocument } from '../schemas/ot-pieces.schema';

@Injectable()
export class OtPiecesService {
  constructor(@InjectModel(OTPieces.name) private readonly otPiecesModel: Model<OTPiecesDocument>) {}

  create(payload: Record<string, unknown>) {
    return new this.otPiecesModel(payload).save();
  }

  findAll() {
    return this.otPiecesModel.find().populate('ot_id').populate('part_id').exec();
  }

  findOne(id: string) {
    return this.otPiecesModel.findById(id).populate('ot_id').populate('part_id').exec();
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.otPiecesModel.findByIdAndUpdate(id, payload, { new: true }).exec();
  }

  remove(id: string) {
    return this.otPiecesModel.findByIdAndDelete(id).exec();
  }
}
