import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PanneSolutionDocument = PanneSolution & Document;

@Schema()
export class PanneSolution {
  @Prop({ required: true, unique: true })
  solution_id: string;

  @Prop({ type: Types.ObjectId, ref: 'Panne', required: true })
  panne_id: Types.ObjectId;

  @Prop()
  cause_probable?: string;

  @Prop()
  solution_recommandee?: string;
}

export const PanneSolutionSchema = SchemaFactory.createForClass(PanneSolution);