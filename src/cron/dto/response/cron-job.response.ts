import { ObjectId } from 'mongoose';
import { CronJob } from 'src/cron/schema/cron-job.schema';
import { WebhookData } from 'src/cron/schema/webhook-data.schema';

export class CronJobResponse {
  id: ObjectId;
  name: string;
  triggerUrl: string;
  apiKey: string;
  schedule: string;
  startDate: Date;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;

  build(cron: CronJob): CronJobResponse {
    this.id = cron._id;
    this.name = cron.name;
    this.triggerUrl = cron.triggerUrl;
    this.apiKey = cron.apiKey;
    this.schedule = cron.schedule;
    this.startDate = cron.startDate;
    this.isActive = cron.isActive;
    this.lastRun = cron.lastRun;
    this.createdAt = cron.createdAt;
    this.updatedAt = cron.updatedAt;
    return this;
  }
}

export class WebhookDataResponse {
  id: ObjectId;
  data: Record<string, any>;
  cronjobId: CronJob;
  createdAt: Date;
  updatedAt: Date;

  build(webhook: WebhookData): WebhookDataResponse {
    this.id = webhook._id;
    this.data = webhook.data;
    this.cronjobId = webhook.cronJobId;
    this.createdAt = webhook.createdAt;
    this.updatedAt = webhook.updatedAt;
    return this;
  }
}
