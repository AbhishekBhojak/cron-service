import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CronJob, CronTime } from 'cron';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CronJobDocument } from './schema/cron-job.schema';
import { SchedulerRegistry } from '@nestjs/schedule';
import { WebhookData, WebHookDocument } from './schema/webhook-data.schema';
import { JobHistory, JobHistoryDocument } from './schema/job-history.schema';

@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SchedulerService.name);
  private jobs: Map<string, CronJob> = new Map();

  constructor(
    @InjectModel(CronJob.name) private cronJobModel: Model<CronJobDocument>,
    @InjectModel(WebhookData.name) private webHookModel: Model<WebHookDocument>,
    @InjectModel(JobHistory.name)
    private jobHistoryModel: Model<JobHistoryDocument>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Initializing Scheduler Service and loading cron jobs...');
    await this.loadJobsFromDatabase();
  }

  async loadJobsFromDatabase(): Promise<void> {
    const now: Date = new Date();

    this.cronTest();

    try {
      const cronJobs = await this.cronJobModel
        .find({
          isActive: true,
          startDate: { $lte: now }, // Ensures jobs scheduled to start now or in the past are loaded
        })
        .exec();

      cronJobs.forEach((job) => {
        const id = job._id.toString();
        if (!this.schedulerRegistry.doesExist('cron', id)) {
          this.addCronJob(job);
        }
      });

      this.logger.log(`${cronJobs.length} cron jobs loaded and scheduled.`);
    } catch (error) {
      this.logger.error('Error loading cron jobs from database:', error);
    }
  }

  async addCronJob(job: CronJobDocument): Promise<void> {
    if (this.jobs.has(job.id)) {
      this.removeCronJob(job.id);
    }

    try {
      const cron: CronJob = new CronJob(
        job.schedule,
        async () => {
          try {
            // Trigger url with valid api key
            const response = await fetch(job.triggerUrl, {
              method: 'GET',
              headers: { 'x-api-key': job.apiKey },
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Parse the response body based on its content type
            const data = await response.json(); // Use .text() or .blob() if required
            console.log('API Response Data:', data);

            await this.logCronJobHistory(job.id, 'success', data);

            await this.logWebhookData(job.id, data);
            // Deactivate the cron-job status
            await this.updateCronJobStatus(job.id, false);
          } catch (error) {
            this.logger.error(
              `Error executing cron job ${job.name}: ${error.message}`,
            );

            await this.logCronJobHistory(job.id, 'failed', error.message);
          }
        },
        null,
        false,
        'Asia/Kolkata',
      );

      if (job.startDate && job.startDate > new Date()) {
        const cronTime: CronTime = new CronTime(job.startDate);
        cron.setTime(cronTime);
      }

      this.jobs.set(job.id, cron);
      cron.start();
      this.logger.log(`Job ${job.name} scheduled for: ${job.schedule}`);
    } catch (error) {
      this.logger.error(
        `Error scheduling cron job ${job.name}: ${error.message}`,
      );
    }
  }

  // teting cron execution
  async cronTest() {
    const testCron = new CronJob(
      '*/1 * * * *', // Every minute
      () => {
        const utcTime = new Date().toISOString();
        const localTime = new Date().toLocaleString('en-US', {
          timeZone: 'Asia/Kolkata',
        });
        this.logger.log(
          `Test cron executed at UTC: ${utcTime}, IST: ${localTime}`,
        );
      },
      null,
      true,
      'Asia/Kolkata',
    );
  }

  async removeCronJob(id: string): Promise<void> {
    const job: CronJob = this.jobs.get(id);
    if (job) {
      job.stop();
      this.jobs.delete(id);
      this.logger.log(`Cron job with ID ${id} has been removed.`);
    } else {
      this.logger.warn(`Cron job with ID ${id} does not exist.`);
    }
  }

  async logCronJobHistory(
    cronJobId: string,
    status: 'success' | 'failed',
    response: any,
  ): Promise<void> {
    try {
      this.jobHistoryModel.create({
        cronJobId: cronJobId,
        status: status,
        response: response,
      });
    } catch (error) {
      this.logger.error(
        `Error logging history for cron job ${cronJobId}: ${error.message}`,
      );
    }
  }

  async logWebhookData(cronJobId: string, data: any): Promise<void> {
    try {
      this.webHookModel.create({
        cronJobId: cronJobId,
        data: JSON.stringify(data),
      });
    } catch (error) {
      this.logger.error(
        `Error logging webhook data for cron jon ${cronJobId}: ${error.message}`,
      );
    }
  }

  async;
  async updateCronJobStatus(id: string, isActive: boolean): Promise<void> {
    await this.cronJobModel.findByIdAndUpdate(id, { isActive });
  }

  async createOrUpdateCronJob(job: CronJobDocument): Promise<void> {
    this.logger.log(`Creating/Updating cron job: ${job.name}`);
    await this.addCronJob(job);
  }

  async deleteCronJob(id: string): Promise<void> {
    this.logger.log(`Deleting cron job: ${id}`);
    await this.removeCronJob(id);
  }
}
