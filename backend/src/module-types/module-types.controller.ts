import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ModuleTypesService } from './module-types.service';
import { CreateModuleTypeDto } from './dto/create-module-type.dto';
import { UpdateModuleTypeDto } from './dto/update-module-type.dto';

@Controller('module-types')
export class ModuleTypesController {
  constructor(private readonly moduleTypesService: ModuleTypesService) {}

  @Post()
  create(@Body() createModuleTypeDto: CreateModuleTypeDto) {
    return this.moduleTypesService.create(createModuleTypeDto);
  }

  @Get()
  findAll() {
    return this.moduleTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleTypesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModuleTypeDto: UpdateModuleTypeDto) {
    return this.moduleTypesService.update(id, updateModuleTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moduleTypesService.remove(id);
  }
}