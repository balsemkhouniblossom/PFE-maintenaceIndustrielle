import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { LubrificationLogsService } from './lubrification-logs.service';

@Controller('lubrification-logs')
export class LubrificationLogsController {
  constructor(private readonly lubrificationLogsService: LubrificationLogsService) {}

  @Post()
  create(@Body() payload: Record<string, unknown>) {
    return this.lubrificationLogsService.create(payload);
  }

  @Get()
  findAll() {
    return this.lubrificationLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lubrificationLogsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: Record<string, unknown>) {
    return this.lubrificationLogsService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lubrificationLogsService.remove(id);
  }
}
