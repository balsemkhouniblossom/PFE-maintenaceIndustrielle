import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MachineTypesService } from './machine-types.service';
import { CreateMachineTypeDto } from './dto/create-machine-type.dto';
import { UpdateMachineTypeDto } from './dto/update-machine-type.dto';
import { normalizePagination } from '../common/pagination';
@Controller('machine-types')
export class MachineTypesController {
  constructor(private readonly machineTypesService: MachineTypesService) {}

  @Post()
  create(@Body() createMachineTypeDto: CreateMachineTypeDto) {
    return this.machineTypesService.create(createMachineTypeDto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pagination = normalizePagination(page, limit);

    return this.machineTypesService.findAll(
      pagination.page,
      pagination.limit,
      pagination.skip,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.machineTypesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMachineTypeDto: UpdateMachineTypeDto,
  ) {
    return this.machineTypesService.update(id, updateMachineTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.machineTypesService.remove(id);
  }
}
