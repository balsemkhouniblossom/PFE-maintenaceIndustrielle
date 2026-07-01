import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OtPiecesService } from './ot-pieces.service';
import { normalizePagination } from '../common/pagination';

@Controller('ot-pieces')
export class OtPiecesController {
  constructor(private readonly otPiecesService: OtPiecesService) {}

  @Post()
  create(@Body() payload: Record<string, unknown>) {
    return this.otPiecesService.create(payload);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pagination = normalizePagination(page, limit);
    return this.otPiecesService.findAll(
      pagination.page,
      pagination.limit,
      pagination.skip,
    );
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
