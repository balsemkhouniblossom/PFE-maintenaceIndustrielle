import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Panne, PanneSchema } from '../schemas/panne.schema';
import { PannesController } from './pannes.controller';
import { PannesService } from './pannes.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Panne.name, schema: PanneSchema }]),
  ],
  controllers: [PannesController],
  providers: [PannesService],
  exports: [PannesService],
})
export class PannesModule {}
