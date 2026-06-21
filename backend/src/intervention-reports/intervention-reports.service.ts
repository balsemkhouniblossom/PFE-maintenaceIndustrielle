import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InterventionReport, InterventionReportDocument } from '../schemas/intervention-report.schema';
import { CreateInterventionReportDto } from './dto/create-intervention-report.dto';
import { UpdateInterventionReportDto } from './dto/update-intervention-report.dto';

@Injectable()
export class InterventionReportsService {
  constructor(
    @InjectModel(InterventionReport.name)
    private interventionReportModel: Model<InterventionReportDocument>,
  ) {}

  async create(createInterventionReportDto: CreateInterventionReportDto): Promise<InterventionReport> {
    const createdInterventionReport = new this.interventionReportModel(createInterventionReportDto);
    return createdInterventionReport.save();
  }

  async findAll(): Promise<InterventionReport[]> {
    return this.interventionReportModel
      .find()
      .populate('ot_id')
      .populate('technician_id')
      .exec();
  }

  async findOne(id: string): Promise<InterventionReport | null> {
    return this.interventionReportModel
      .findById(id)
      .populate('ot_id')
      .populate('technician_id')
      .exec();
  }

  async update(id: string, updateInterventionReportDto: UpdateInterventionReportDto): Promise<InterventionReport | null> {
    return this.interventionReportModel
      .findByIdAndUpdate(id, updateInterventionReportDto, { new: true })
      .populate('ot_id')
      .populate('technician_id')
      .exec();
  }

  async remove(id: string): Promise<InterventionReport | null> {
    return this.interventionReportModel.findByIdAndDelete(id).exec();
  }
}
