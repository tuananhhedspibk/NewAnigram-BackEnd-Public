import mongoose, { Schema } from 'mongoose';

import { FollowInterface } from './interfaces';

export const FollowSchema: Schema = new Schema({
  follower: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  following: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  createdAt: { type: Schema.Types.Date },
});

mongoose.model<FollowInterface>('follow', FollowSchema);
