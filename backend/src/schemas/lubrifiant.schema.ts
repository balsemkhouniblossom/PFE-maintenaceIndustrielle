import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LubrifiantDocument = Lubrifiant & Document;

@Schema()
export class Lubrifiant {
  @Prop({ required: true, unique: true })
  lubrifiant_id: string;

  @Prop({ required: true })
  nom: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  viscosite?: string;

  @Prop()
  usage?: string;
}

export const LubrifiantSchema = SchemaFactory.createForClass(Lubrifiant);