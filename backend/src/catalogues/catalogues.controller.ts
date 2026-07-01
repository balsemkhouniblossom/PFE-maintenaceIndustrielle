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

import { normalizePagination } from '../common/pagination';
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
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pagination = normalizePagination(page, limit);

    return this.cataloguesService.findAll(
      pagination.page,
      pagination.limit,
      pagination.skip,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cataloguesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCatalogueDto: UpdateCatalogueDto,
  ) {
    return this.cataloguesService.update(id, updateCatalogueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cataloguesService.remove(id);
  }
}
