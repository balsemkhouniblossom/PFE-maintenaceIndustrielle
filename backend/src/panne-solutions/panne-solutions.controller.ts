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
import { PanneSolutionsService } from './panne-solutions.service';
import { CreatePanneSolutionDto } from './dto/create-panne-solution.dto';
import { UpdatePanneSolutionDto } from './dto/update-panne-solution.dto';
import { normalizePagination } from '../common/pagination';

@Controller('panne-solutions')
export class PanneSolutionsController {
  constructor(private readonly panneSolutionsService: PanneSolutionsService) {}

  @Post()
  create(@Body() createPanneSolutionDto: CreatePanneSolutionDto) {
    return this.panneSolutionsService.create(createPanneSolutionDto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pagination = normalizePagination(page, limit);
    return this.panneSolutionsService.findAll(
      pagination.page,
      pagination.limit,
      pagination.skip,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.panneSolutionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePanneSolutionDto: UpdatePanneSolutionDto,
  ) {
    return this.panneSolutionsService.update(id, updatePanneSolutionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.panneSolutionsService.remove(id);
  }
}
