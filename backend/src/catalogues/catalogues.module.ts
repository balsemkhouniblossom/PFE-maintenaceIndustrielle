import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CataloguesService } from './catalogues.service';
import { CataloguesController } from './catalogues.controller';
import { Catalogue, CatalogueSchema } from '../schemas/catalogue.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Catalogue.name, schema: CatalogueSchema },
    ]),
  ],
  controllers: [CataloguesController],
  providers: [CataloguesService],
  exports: [CataloguesService],
})
export class CataloguesModule {}
