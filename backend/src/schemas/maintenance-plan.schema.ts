import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MaintenancePlanDocument = MaintenancePlan & Document;

@Schema()
export class MaintenancePlan {
  @Prop({ required: true, unique: true })
  plan_id: string;

  @Prop({ type: Types.ObjectId, ref: 'Module', required: true })
  module_id: Types.ObjectId;

  @Prop({ required: true })
  type_maintenance: string;

  @Prop({ required: true })
  frequence: number;

  @Prop({ required: true })
  unite_frequence: string;

  @Prop()
  instruction?: string;
}

export const MaintenancePlanSchema = SchemaFactory.createForClass(MaintenancePlan);