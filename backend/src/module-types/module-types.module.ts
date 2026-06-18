import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleTypesService } from './module-types.service';
import { ModuleTypesController } from './module-types.controller';
import { ModuleType, ModuleTypeSchema } from '../schemas/module-type.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ModuleType.name, schema: ModuleTypeSchema }])],
  controllers: [ModuleTypesController],
  providers: [ModuleTypesService],
  exports: [ModuleTypesService],
})
export class ModuleTypesModule {}