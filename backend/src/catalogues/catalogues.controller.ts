import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CataloguesService } from './catalogues.service';
import { CreateCatalogueDto } from './dto/create-catalogue.dto';
import { UpdateCatalogueDto } from './dto/update-catalogue.dto';

@Controller('catalogues')
export class CataloguesController {
  constructor(private readonly cataloguesService: CataloguesService) {}

  @Post()
  create(@Body() createCatalogueDto: CreateCatalogueDto) {
    return this.cataloguesService.create(createCatalogueDto);
  }

  @Get()
  findAll() {
    return this.cataloguesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cataloguesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCatalogueDto: UpdateCatalogueDto) {
    return this.cataloguesService.update(id, updateCatalogueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cataloguesService.remove(id);
  }
}