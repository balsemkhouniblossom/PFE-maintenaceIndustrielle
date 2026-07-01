import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StockDocument = Stock & Document;

@Schema()
export class Stock {
  @Prop({ required: true, unique: true })
  stock_id: string;

  @Prop({ type: Types.ObjectId, ref: 'Catalogue', required: true })
  part_id: Types.ObjectId;

  @Prop({ required: true })
  quantite_en_stock: number;

  @Prop()
  seuil_alerte_stock?: number;

  @Prop()
  quantite_minimale?: number;

  @Prop()
  emplacement?: string;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
