import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { LubrifiantsService } from './lubrifiants.service';

@Controller('lubrifiants')
export class LubrifiantsController {
  constructor(private readonly lubrifiantsService: LubrifiantsService) {}

  @Post()
  create(@Body() payload: Record<string, unknown>) {
    return this.lubrifiantsService.create(payload);
  }

  @Get()
  findAll() {
    return this.lubrifiantsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lubrifiantsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: Record<string, unknown>) {
    return this.lubrifiantsService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lubrifiantsService.remove(id);
  }
}
