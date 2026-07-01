import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OTPiecesDocument = OTPieces & Document;

@Schema()
export class OTPieces {
  @Prop({ type: Types.ObjectId, ref: 'WorkOrder', required: true })
  ot_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Catalogue', required: true })
  part_id: Types.ObjectId;

  @Prop({ required: true })
  quantite: number;
}

export const OTPiecesSchema = SchemaFactory.createForClass(OTPieces);
