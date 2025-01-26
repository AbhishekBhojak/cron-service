import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CronCreateRequest,
  CronUpdateRequest,
} from './dto/request/cron-job.request';
import { CronJob, CronJobDocument } from './schema/cron-job.schema';
import { WebhookData, WebHookDocument } from './schema/webhook-data.schema';
import { PaginatedResponse, QueryOptions } from './interface/api.interface';
import { getOrder, getWhere } from './decorator';
import { SchedulerService } from './scheduler.service';

@Injectable()
export class CronService {
  constructor(
    @InjectModel(CronJob.name) private cronJobModel: Model<CronJobDocument>,
    @InjectModel(WebhookData.name)
    private webhookDataModel: Model<WebHookDocument>,
    private readonly schedulerService: SchedulerService,
  ) {}

  async create(createCronJobDto: CronCreateRequest): Promise<CronJobDocument> {
    const cronJob: CronJobDocument = new this.cronJobModel(createCronJobDto);
    cronJob.isActive = true;
    const savedJob: CronJobDocument = await cronJob.save();
    await this.schedulerService.createOrUpdateCronJob(savedJob);
    return savedJob;
  }

  async findAll(
    options: QueryOptions<CronJob>,
  ): Promise<PaginatedResponse<CronJob>> {
    const filterConditions = options.filters ? getWhere(options.filters) : {};

    const sortConditions = options.sorting ? getOrder(options.sorting) : {};

    const page: number = Math.max(1, options.pagination?.skip || 1);
    const limit: number = Math.max(1, options.pagination?.limit || 10);

    const cronJob: CronJob[] = await this.cronJobModel
      .find(filterConditions)
      .sort(sortConditions)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      items: cronJob,
      page: page,
      size: limit,
      total: cronJob.length,
    };
  }

  async update(
    id: string,
    updateCronJobDto: CronUpdateRequest,
  ): Promise<CronJob> {
    const cronJob: CronJobDocument = await this.cronJobModel
      .findByIdAndUpdate(id, updateCronJobDto, { new: true })
      .exec();

    if (cronJob) {
      await this.schedulerService.createOrUpdateCronJob(cronJob);
    }
    return cronJob;
  }

  async delete(id: string): Promise<CronJob> {
    const cronJob: CronJobDocument = await this.cronJobModel
      .findByIdAndDelete(id)
      .exec();
    this.schedulerService.removeCronJob(id);
    return cronJob;
  }

  async getWebhookData(
    options: QueryOptions<WebhookData>,
  ): Promise<PaginatedResponse<WebhookData>> {
    const filterConditions = options.filters ? getWhere(options.filters) : {};

    const sortConditions = options.sorting ? getOrder(options.sorting) : {};

    const page: number = Math.max(1, options.pagination?.skip || 1);
    const limit: number = Math.max(1, options.pagination?.limit || 10);
    const webhook: WebhookData[] = await this.webhookDataModel
      .find(filterConditions)
      .sort(sortConditions)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('cronJobId')
      .exec();

    return {
      items: webhook,
      page: page,
      size: limit,
      total: webhook.length,
    };
  }
}
