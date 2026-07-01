import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MachineDocument = Machine & Document;

@Schema()
export class Machine {
  @Prop({ required: true, unique: true })
  machine_id: string;

  @Prop({ type: Types.ObjectId, ref: 'MachineType', required: true })
  type_id: Types.ObjectId;

  @Prop({ required: true })
  serial_no: string;

  @Prop()
  reference?: string;

  @Prop({ type: Date })
  installation_date?: Date;

  @Prop()
  poids_kg?: number;

  @Prop()
  fabricant?: string;

  @Prop()
  model?: string;

  @Prop()
  location?: string;

  @Prop({ required: true })
  status: string;
}

export const MachineSchema = SchemaFactory.createForClass(Machine);
MachineSchema.index({ type_id: 1, status: 1 });
MachineSchema.index({ serial_no: 1 });
