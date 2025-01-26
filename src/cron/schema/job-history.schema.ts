import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { CronJob } from './cron-job.schema';

export type JobHistoryDocument = JobHistory & Document;
@Schema({ timestamps: true })
export class JobHistory {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CronJob',
  })
  cronJobId: CronJob;

  @Prop({ required: true })
  status: 'success' | 'failed';

  @Prop()
  response: string;

  @Prop()
  error?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const JobHistorySchema = SchemaFactory.createForClass(JobHistory);
