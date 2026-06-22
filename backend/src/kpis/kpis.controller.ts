import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { KpisService } from './kpis.service';

@Controller('kpis')
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Post()
  create(@Body() payload: Record<string, unknown>) {
    return this.kpisService.create(payload);
  }

  @Get()
  findAll() {
    return this.kpisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kpisService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: Record<string, unknown>) {
    return this.kpisService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kpisService.remove(id);
  }
}
