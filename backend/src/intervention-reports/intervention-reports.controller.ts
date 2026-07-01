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
import { InterventionReportsService } from './intervention-reports.service';
import { CreateInterventionReportDto } from './dto/create-intervention-report.dto';
import { UpdateInterventionReportDto } from './dto/update-intervention-report.dto';
import { normalizePagination } from '../common/pagination';

@Controller('intervention-reports')
export class InterventionReportsController {
  constructor(
    private readonly interventionReportsService: InterventionReportsService,
  ) {}

  @Post()
  create(@Body() createInterventionReportDto: CreateInterventionReportDto) {
    return this.interventionReportsService.create(createInterventionReportDto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pagination = normalizePagination(page, limit);
    return this.interventionReportsService.findAll(
      pagination.page,
      pagination.limit,
      pagination.skip,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interventionReportsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInterventionReportDto: UpdateInterventionReportDto,
  ) {
    return this.interventionReportsService.update(
      id,
      updateInterventionReportDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interventionReportsService.remove(id);
  }
}
