import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CronJob, CronTime } from 'cron';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CronJobDocument } from './schema/cron-job.schema';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SchedulerService.name);
  private jobs: Map<string, CronJob> = new Map();

  constructor(
    @InjectModel('CronJob')
    private readonly cronJobModel: Model<CronJobDocument>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Initializing Scheduler Service and loading cron jobs...');
    await this.loadJobsFromDatabase();
  }

  async loadJobsFromDatabase(): Promise<void> {
    const now: Date = new Date();

    this.test();
    try {
      const cronJobs = await this.cronJobModel
        .find({
          isActive: true,
          startDate: { $lte: now }, // Ensures jobs scheduled to start now or in the past are loaded
        })
        .exec();

      cronJobs.forEach((job) => {
        const id = job._id.toString(); // Convert ObjectId to string
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
      this.logger.warn(
        `Cron job with ID ${job.id} already exists. Replacing it.`,
      );
      this.removeCronJob(job.id);
    }

    try {
      const cron: CronJob = new CronJob(
        job.schedule,
        async () => {
          this.logger.log(`Executing cron job: ${job.name}`);
          try {
            const response = await fetch(job.triggerUrl, {
              method: 'POST',
              headers: { 'x-api-key': job.apiKey },
            });

            const logText = await response.text();
            this.logger.log(`Response: ${logText}`);
            const responseData = await response.json();
            this.logger.log(`Cron job ${job.name} executed successfully.`);

            await this.logCronJobHistory(job.id, 'success', responseData);

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
      this.logger.log(`Server current time: ${new Date().toISOString()}`);
      this.logger.log(`Cron job ${job.name} has been scheduled.`);
      this.logger.log(`Job ${job.name} scheduled for: ${job.schedule}`);
    } catch (error) {
      this.logger.error(
        `Error scheduling cron job ${job.name}: ${error.message}`,
      );
    }
  }

  async test() {
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
      true, // Start immediately
      'Asia/Kolkata', // Your desired time zone
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
      await this.cronJobModel.updateOne(
        { _id: cronJobId },
        { $push: { history: { status, response, triggeredAt: new Date() } } },
      );
    } catch (error) {
      this.logger.error(
        `Error logging history for cron job ${cronJobId}: ${error.message}`,
      );
    }
  }

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
