import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MaintenancePlanDocument = MaintenancePlan & Document;

@Schema()
export class MaintenancePlan {
  @Prop({ required: true, unique: true })
  plan_id!: string;

  @Prop({ type: Types.ObjectId, ref: 'Module', required: true })
  module_id!: Types.ObjectId;

  @Prop({ required: true })
  type_maintenance!: string;

  @Prop({ required: true })
  frequence!: number;

  @Prop({ required: true })
  unite_frequence!: string;

  @Prop()
  instruction?: string;

  @Prop()
  responsable?: string;

  @Prop()
  huile_graisse?: string;

  @Prop()
  documentation?: string;

  @Prop()
  maintenance_code?: string;

  @Prop()
  frequence_label?: string;
}

export const MaintenancePlanSchema = SchemaFactory.createForClass(MaintenancePlan);
MaintenancePlanSchema.index({ plan_id: 1 }, { unique: true });
MaintenancePlanSchema.index({ module_id: 1, type_maintenance: 1 });