import mongoose, { Schema } from 'mongoose';

import { ActiveAccountKeyInterface } from './interfaces';

export const ActiveAccountKeySchema: Schema = new Schema({
  rawValue: {
    type: Schema.Types.String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  expiredAt: {
    type: Schema.Types.Date,
    required: true,
  },
  createdAt: { type: Schema.Types.Date },
  updatedAt: { type: Schema.Types.Date },
});

mongoose.model<ActiveAccountKeyInterface>(
  'activeAccountKey', ActiveAccountKeySchema
);
