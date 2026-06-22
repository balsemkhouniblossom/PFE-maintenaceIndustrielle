import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { OtPiecesService } from './ot-pieces.service';

@Controller('ot-pieces')
export class OtPiecesController {
  constructor(private readonly otPiecesService: OtPiecesService) {}

  @Post()
  create(@Body() payload: Record<string, unknown>) {
    return this.otPiecesService.create(payload);
  }

  @Get()
  findAll() {
    return this.otPiecesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.otPiecesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: Record<string, unknown>) {
    return this.otPiecesService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.otPiecesService.remove(id);
  }
}
