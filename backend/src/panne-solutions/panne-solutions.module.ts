import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PanneSolution, PanneSolutionSchema } from '../schemas/panne-solution.schema';
import { PanneSolutionsController } from './panne-solutions.controller';
import { PanneSolutionsService } from './panne-solutions.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PanneSolution.name, schema: PanneSolutionSchema }]),
  ],
  controllers: [PanneSolutionsController],
  providers: [PanneSolutionsService],
  exports: [PanneSolutionsService],
})
export class PanneSolutionsModule {}
