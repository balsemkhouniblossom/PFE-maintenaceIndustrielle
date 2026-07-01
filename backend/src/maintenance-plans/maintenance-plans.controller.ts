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
import { MaintenancePlansService } from './maintenance-plans.service';
import { normalizePagination } from '../common/pagination';

@Controller('maintenance-plans')
export class MaintenancePlansController {
  constructor(
    private readonly maintenancePlansService: MaintenancePlansService,
  ) {}

  @Post()
  create(@Body() payload: Record<string, unknown>) {
    return this.maintenancePlansService.create(payload);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pagination = normalizePagination(page, limit);
    return this.maintenancePlansService.findAll(
      pagination.page,
      pagination.limit,
      pagination.skip,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenancePlansService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: Record<string, unknown>) {
    return this.maintenancePlansService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.maintenancePlansService.remove(id);
  }
}
