import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkOrderDocument = WorkOrder & Document;

@Schema()
export class WorkOrder {
  @Prop({ required: true, unique: true })
  ot_id: string;

  @Prop({ type: Types.ObjectId, ref: 'Machine', required: true })
  machine_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Module' })
  module_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  technician_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'MaintenancePlan' })
  plan_id?: Types.ObjectId;

  @Prop()
  description?: string;

  @Prop()
  type_maintenance?: string;

  @Prop({ required: true })
  status: string;

  @Prop()
  priorite?: string;

  @Prop()
  code_panne?: string;

  @Prop({ type: Date, required: true })
  date_created: Date;

  @Prop({ type: Date })
  date_start?: Date;

  @Prop({ type: Date })
  date_end?: Date;

  @Prop({ type: Date })
  date_closed?: Date;
}

export const WorkOrderSchema = SchemaFactory.createForClass(WorkOrder);
WorkOrderSchema.index({ ot_id: 1 }, { unique: true });
WorkOrderSchema.index({ machine_id: 1, status: 1 });
WorkOrderSchema.index({ technician_id: 1, status: 1 });
WorkOrderSchema.index({ date_created: -1, status: 1 });