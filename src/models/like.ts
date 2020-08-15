import mongoose, { Schema } from 'mongoose';

import { LikeInterface } from './interfaces';

export const LikeSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  createdAt: { type: Schema.Types.Date },
});

mongoose.model<LikeInterface>('like', LikeSchema);
