import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchedulerService } from './scheduler.service';
import { CronJobSchema } from './schema/cron-job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'CronJob', schema: CronJobSchema }]),
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
