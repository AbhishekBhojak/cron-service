import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CronController } from './cron.controller';
import { CronService } from './cron.service';
import { CronJob, CronJobSchema } from './schema/cron-job.schema';
import { JobHistory, JobHistorySchema } from './schema/job-history.schema';
import { WebhookData, WebhookDataSchema } from './schema/webhook-data.schema';
import { SchedulerModule } from './scheduler.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CronJob.name, schema: CronJobSchema },
      { name: JobHistory.name, schema: JobHistorySchema },
      { name: WebhookData.name, schema: WebhookDataSchema },
    ]),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute in milliseconds
        limit: 10, // 10 requests per ttl
      },
    ]),
    SchedulerModule,
  ],
  controllers: [CronController],
  providers: [
    CronService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class CronModule {}
