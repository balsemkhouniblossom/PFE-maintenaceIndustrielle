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

import { normalizePagination } from '../common/pagination';
import { PannesService } from './pannes.service';
import { CreatePanneDto } from './dto/create-panne.dto';
import { UpdatePanneDto } from './dto/update-panne.dto';

@Controller('pannes')
export class PannesController {
  constructor(private readonly pannesService: PannesService) {}

  @Post()
  create(@Body() createPanneDto: CreatePanneDto) {
    return this.pannesService.create(createPanneDto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pagination = normalizePagination(page, limit);

    return this.pannesService.findAll(
      pagination.page,
      pagination.limit,
      pagination.skip,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pannesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePanneDto: UpdatePanneDto) {
    return this.pannesService.update(id, updatePanneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pannesService.remove(id);
  }
}
