import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CatalogueDocument = Catalogue & Document;

@Schema()
export class Catalogue {
  @Prop({ required: true, unique: true })
  part_id: string;

  @Prop({ required: true })
  nom_piece: string;

  @Prop({ required: true })
  ref_constructeur: string;

  @Prop()
  fabricant?: string;

  @Prop()
  categorie_piece?: string;
}

export const CatalogueSchema = SchemaFactory.createForClass(Catalogue);
