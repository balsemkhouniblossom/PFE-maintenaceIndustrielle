import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type KPIDocument = KPI & Document;

@Schema()
export class KPI {
  @Prop({ required: true, unique: true })
  kpi_id: string;

  @Prop({ type: Types.ObjectId, ref: 'Machine', required: true })
  machine_id: Types.ObjectId;

  @Prop()
  mtbf_value?: number;

  @Prop()
  mttr_value?: number;

  @Prop()
  availability_rate?: number;

  @Prop({ type: Date, required: true })
  date_calcul: Date;

  @Prop({ type: Date, required: true })
  periode_debut: Date;

  @Prop({ type: Date, required: true })
  periode_fin: Date;
}

export const KPISchema = SchemaFactory.createForClass(KPI);