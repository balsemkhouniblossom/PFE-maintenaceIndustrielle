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
import { LubrificationLogsService } from './lubrification-logs.service';
import { normalizePagination } from '../common/pagination';

@Controller('lubrification-logs')
export class LubrificationLogsController {
  constructor(
    private readonly lubrificationLogsService: LubrificationLogsService,
  ) {}

  @Post()
  create(@Body() payload: Record<string, unknown>) {
    return this.lubrificationLogsService.create(payload);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pagination = normalizePagination(page, limit);
    return this.lubrificationLogsService.findAll(
      pagination.page,
      pagination.limit,
      pagination.skip,
    );
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
