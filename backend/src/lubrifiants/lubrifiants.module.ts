import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lubrifiant, LubrifiantSchema } from '../schemas/lubrifiant.schema';
import { LubrifiantsController } from './lubrifiants.controller';
import { LubrifiantsService } from './lubrifiants.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Lubrifiant.name, schema: LubrifiantSchema }])],
  controllers: [LubrifiantsController],
  providers: [LubrifiantsService],
  exports: [LubrifiantsService],
})
export class LubrifiantsModule {}
