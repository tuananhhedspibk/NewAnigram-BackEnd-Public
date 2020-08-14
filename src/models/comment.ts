import mongoose, { Schema } from 'mongoose';

import { CommentInterface } from './interfaces';

export const CommentSchema: Schema = new Schema({
  content: {
    type: Schema.Types.String,
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  createdAt: { type: Schema.Types.Date },
  updatedAt: { type: Schema.Types.Date },
});

mongoose.model<CommentInterface>('comment', CommentSchema);
