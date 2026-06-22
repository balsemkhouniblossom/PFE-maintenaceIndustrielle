import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { MaintenancePlansService } from './maintenance-plans.service';

@Controller('maintenance-plans')
export class MaintenancePlansController {
  constructor(private readonly maintenancePlansService: MaintenancePlansService) {}

  @Post()
  create(@Body() payload: Record<string, unknown>) {
    return this.maintenancePlansService.create(payload);
  }

  @Get()
  findAll() {
    return this.maintenancePlansService.findAll();
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
