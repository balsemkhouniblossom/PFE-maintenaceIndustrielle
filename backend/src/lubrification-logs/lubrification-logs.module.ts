import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LubrificationLog, LubrificationLogSchema } from '../schemas/lubrification-log.schema';
import { LubrificationLogsController } from './lubrification-logs.controller';
import { LubrificationLogsService } from './lubrification-logs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LubrificationLog.name, schema: LubrificationLogSchema },
    ]),
  ],
  controllers: [LubrificationLogsController],
  providers: [LubrificationLogsService],
  exports: [LubrificationLogsService],
})
export class LubrificationLogsModule {}
