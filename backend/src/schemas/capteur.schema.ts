import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CapteurDocument = Capteur & Document;

@Schema()
export class Capteur {
  @Prop({ required: true, unique: true })
  capteur_id: string;

  @Prop({ type: Types.ObjectId, ref: 'Module', required: true })
  module_id: Types.ObjectId;

  @Prop({ required: true })
  code_capteur: string;

  @Prop({ required: true })
  type_capteur: string;

  @Prop()
  unite_mesure?: string;

  @Prop()
  mqtt_topic?: string;

  @Prop()
  seuil_avertissement?: number;

  @Prop()
  seuil_critique?: number;

  @Prop()
  frequence_echantillonnage?: number;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: Date })
  last_seen_at?: Date;

  @Prop()
  firmware_version?: string;
}

export const CapteurSchema = SchemaFactory.createForClass(Capteur);