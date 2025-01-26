import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { CronJob } from './cron-job.schema';

@Schema({ timestamps: true })
export class WebhookData {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.Mixed,
  })
  data: Record<string, any>;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CronJob',
  })
  cronJobId: CronJob;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const WebhookDataSchema = SchemaFactory.createForClass(WebhookData);
