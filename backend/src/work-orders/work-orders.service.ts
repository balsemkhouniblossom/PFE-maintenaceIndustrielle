import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkOrder, WorkOrderDocument } from '../schemas/work-order.schema';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

@Injectable()
export class WorkOrdersService {
  constructor(
    @InjectModel(WorkOrder.name) private workOrderModel: Model<WorkOrderDocument>,
  ) {}

  async create(createWorkOrderDto: CreateWorkOrderDto): Promise<WorkOrder> {
    const createdWorkOrder = new this.workOrderModel(createWorkOrderDto);
    return createdWorkOrder.save();
  }

  async findAll(): Promise<WorkOrder[]> {
    try {
      return await this.workOrderModel.find()
        .populate('machine_id')
        .populate('module_id')
        .populate('technician_id')
        .exec();
    } catch (error) {
      // If populate fails, return work orders without population
      console.warn('Failed to populate work order references:', error);
      return this.workOrderModel.find().exec();
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      return await this.workOrderModel.findById(id)
        .populate('machine_id')
        .populate('module_id')
        .populate('technician_id')
        .exec();
    } catch (error) {
      // If populate fails, return work order without population
      console.warn('Failed to populate work order references for id:', id, error);
      return this.workOrderModel.findById(id).exec();
    }
  }

  async update(id: string, updateWorkOrderDto: UpdateWorkOrderDto): Promise<any> {
    return this.workOrderModel.findByIdAndUpdate(id, updateWorkOrderDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    return this.workOrderModel.findByIdAndDelete(id).exec();
  }

  async getStatistics() {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Get work orders for current month
    const currentMonthOrders = await this.workOrderModel.find({
      date_created: { $gte: currentMonth, $lt: nextMonth }
    }).exec();

    // Get work orders for last month
    const lastMonthOrders = await this.workOrderModel.find({
      date_created: { $gte: lastMonth, $lt: currentMonth }
    }).exec();

    // Get pending work orders (assuming 'pending' or 'open' status indicates due maintenance)
    const pendingOrders = await this.workOrderModel.find({
      status: { $in: ['pending', 'open', 'in_progress'] }
    }).exec();

    // Calculate percentage change
    const currentCount = currentMonthOrders.length;
    const lastCount = lastMonthOrders.length;
    const percentageChange = lastCount > 0 ? ((currentCount - lastCount) / lastCount) * 100 : 0;

    return {
      currentMonthWorkOrders: currentCount,
      lastMonthWorkOrders: lastCount,
      percentageChange: Math.round(percentageChange * 100) / 100, // Round to 2 decimal places
      pendingMaintenance: pendingOrders.length,
      totalWorkOrders: await this.workOrderModel.countDocuments().exec()
    };
  }
}