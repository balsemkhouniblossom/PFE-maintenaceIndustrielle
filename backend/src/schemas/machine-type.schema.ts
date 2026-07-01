import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MachineTypeDocument = MachineType & Document;

@Schema({ timestamps: true })
export class MachineType {
  @Prop({ required: true, unique: true })
  type_id: number;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;
}

export const MachineTypeSchema = SchemaFactory.createForClass(MachineType);
