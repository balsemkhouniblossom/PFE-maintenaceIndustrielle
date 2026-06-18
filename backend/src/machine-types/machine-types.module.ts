import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MachineTypesService } from './machine-types.service';
import { MachineTypesController } from './machine-types.controller';
import { MachineType, MachineTypeSchema } from '../schemas/machine-type.schema';
import { CounterModule } from '../counters/counter.module'; // 👈 ADD
@Module({
  imports: [MongooseModule.forFeature([{ name: MachineType.name, schema: MachineTypeSchema }]),
CounterModule,],
  controllers: [MachineTypesController],
  providers: [MachineTypesService],
  exports: [MachineTypesService],
})
export class MachineTypesModule {}