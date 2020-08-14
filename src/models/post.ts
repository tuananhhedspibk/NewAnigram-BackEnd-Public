import mongoose, { Schema } from 'mongoose';

import { PostInterface } from './interfaces';

export const PostSchema: Schema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  content: {
    type: Schema.Types.String,
    required: true,
  },
  numberLikes: {
    type: Schema.Types.Number,
    default: 0
  },
  numberComments: {
    type: Schema.Types.Number,
    default: 0
  },
  images: {
    type: [{
      source: { type: Schema.Types.String },
    }],
    required: true,
  },
  tags: { type: [ Schema.Types.String ] },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  comments: [{
    type: Schema.Types.ObjectId,
    required: true,
  }],
  createdAt: { type: Schema.Types.Date },
  updatedAt: { type: Schema.Types.Date },
});

mongoose.model<PostInterface>('post', PostSchema);
