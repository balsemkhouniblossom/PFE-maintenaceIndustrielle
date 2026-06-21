import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { InterventionReportsService } from './intervention-reports.service';
import { CreateInterventionReportDto } from './dto/create-intervention-report.dto';
import { UpdateInterventionReportDto } from './dto/update-intervention-report.dto';

@Controller('intervention-reports')
export class InterventionReportsController {
  constructor(private readonly interventionReportsService: InterventionReportsService) {}

  @Post()
  create(@Body() createInterventionReportDto: CreateInterventionReportDto) {
    return this.interventionReportsService.create(createInterventionReportDto);
  }

  @Get()
  findAll() {
    return this.interventionReportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interventionReportsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInterventionReportDto: UpdateInterventionReportDto) {
    return this.interventionReportsService.update(id, updateInterventionReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interventionReportsService.remove(id);
  }
}
