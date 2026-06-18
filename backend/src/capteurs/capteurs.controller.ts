import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CapteursService } from './capteurs.service';
import { CreateCapteurDto } from './dto/create-capteur.dto';
import { UpdateCapteurDto } from './dto/update-capteur.dto';

@Controller('capteurs')
export class CapteursController {
  constructor(private readonly capteursService: CapteursService) {}

  @Post()
  create(@Body() createCapteurDto: CreateCapteurDto) {
    return this.capteursService.create(createCapteurDto);
  }

  @Get()
  findAll() {
    return this.capteursService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.capteursService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCapteurDto: UpdateCapteurDto) {
    return this.capteursService.update(id, updateCapteurDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.capteursService.delete(id);
  }
}
