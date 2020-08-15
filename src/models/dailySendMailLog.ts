import mongoose, { Schema } from 'mongoose';

import { DailySendMailLogInterface } from './interfaces';

export const DailySendMailLogSchema: Schema = new Schema({
  email: {
    type: Schema.Types.String,
    required: true,
  },
  createdAt: { type: Schema.Types.Date },
});

mongoose.model<DailySendMailLogInterface>(
  'dailySendMailLog', DailySendMailLogSchema
);
