import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CapteursController } from './capteurs.controller';
import { CapteursService } from './capteurs.service';
import { Capteur, CapteurSchema } from '../schemas/capteur.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Capteur.name, schema: CapteurSchema }])],
  controllers: [CapteursController],
  providers: [CapteursService]
})
export class CapteursModule {}
