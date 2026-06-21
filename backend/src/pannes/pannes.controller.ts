import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
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
  findAll() {
    return this.pannesService.findAll();
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
