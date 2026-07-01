import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PanneDocument = Panne & Document;

@Schema()
export class Panne {
  @Prop({ required: true, unique: true })
  panne_id: string;

  @Prop({ required: true })
  code_panne: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  gravite?: string;
}

export const PanneSchema = SchemaFactory.createForClass(Panne);
