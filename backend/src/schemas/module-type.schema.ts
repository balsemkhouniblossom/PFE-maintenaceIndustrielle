import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ModuleTypeDocument = ModuleType & Document;

@Schema()
export class ModuleType {
  @Prop({ required: true, unique: true })
  mod_type_id: string;

  @Prop({ type: Types.ObjectId, ref: 'MachineType', required: true })
  type_id: Types.ObjectId;

  @Prop({ required: true })
  nom_module: string;

  @Prop()
  categorie_module?: string;
}

export const ModuleTypeSchema = SchemaFactory.createForClass(ModuleType);
