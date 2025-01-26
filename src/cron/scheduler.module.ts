import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchedulerService } from './scheduler.service';
import { CronJob, CronJobSchema } from './schema/cron-job.schema';
import { WebhookData, WebhookDataSchema } from './schema/webhook-data.schema';
import { JobHistory, JobHistorySchema } from './schema/job-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CronJob.name, schema: CronJobSchema },
      { name: WebhookData.name, schema: WebhookDataSchema },
      { name: JobHistory.name, schema: JobHistorySchema },
    ]),
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
