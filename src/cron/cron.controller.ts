import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  ValidationPipe,
  Headers,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CronService } from './cron.service';
import {
  CronCreateRequest,
  CronUpdateRequest,
} from './dto/request/cron-job.request';
import {
  CronJobResponse,
  WebhookDataResponse,
} from './dto/response/cron-job.response';
import { CronJob, CronJobDocument } from './schema/cron-job.schema';
import { WebhookData } from './schema/webhook-data.schema';
import {
  Filtering,
  FilteringParams,
  Pagination,
  PaginationParams,
  Sorting,
  SortingParams,
} from './decorator';
import { PaginatedResponse } from './interface/api.interface';

@Controller('api/v1/cron-jobs/')
@UseGuards(ThrottlerGuard)
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Post()
  async create(
    @Body(ValidationPipe) createCronJobDto: CronCreateRequest,
  ): Promise<CronJobResponse> {
    try {
      const cronJon: CronJobDocument =
        await this.cronService.create(createCronJobDto);
      return new CronJobResponse().build(cronJon);
    } catch (e) {
      console.error(e);
    }
  }

  @Get()
  async findAll(
    @PaginationParams() pagination: Pagination,
    @SortingParams() sorting: Sorting,
    @FilteringParams() filters: Filtering<CronJob>[],
  ): Promise<PaginatedResponse<CronJobResponse>> {
    const cronJob: PaginatedResponse<CronJob> = await this.cronService.findAll({
      pagination,
      filters,
      sorting,
    });
    return {
      items: cronJob.items.map((item: CronJob) =>
        new CronJobResponse().build(item),
      ),
      page: cronJob.page,
      size: cronJob.size,
      total: cronJob.total,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateCronJobDto: CronUpdateRequest,
  ): Promise<CronJobResponse> {
    const cronJon: CronJob = await this.cronService.update(
      id,
      updateCronJobDto,
    );
    return new CronJobResponse().build(cronJon);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<CronJobResponse> {
    const cronJob: CronJob = await this.cronService.delete(id);
    return new CronJobResponse().build(cronJob);
  }

  @Get('webhook')
  async getWebhookData(
    @PaginationParams() pagination: Pagination,
    @SortingParams() sorting: Sorting,
    @FilteringParams() filters: Filtering<WebhookData>[],
  ): Promise<PaginatedResponse<WebhookDataResponse>> {
    const webhook: PaginatedResponse<WebhookData> =
      await this.cronService.getWebhookData({
        pagination,
        filters,
        sorting,
      });
    return {
      items: webhook.items.map((item: WebhookData) =>
        new WebhookDataResponse().build(item),
      ),
      page: webhook.page,
      size: webhook.size,
      total: webhook.total,
    };
  }

  // Execute cron triggerUrl
  @Get('trigger-cron')
  async triggerCron(): Promise<string> {
    const data: any = {
      name: 'trigger',
      subject: 'trigger cron event',
    };
    return JSON.stringify(data);
  }
}
