import mongoose, { Schema } from 'mongoose';

import { NotificationInterface } from './interfaces';

export const NotificationSchema: Schema = new Schema({
  destUser: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  follower: {
    type: Schema.Types.ObjectId,
  },
  post: {
    type: Schema.Types.ObjectId,
  },
  type: {
    type: Schema.Types.Number,
    required: true,
  },
  image: {
    type: Schema.Types.String,
    default: 'https://images.newanigram.net/defaults/notification.png',
  },
  content: {
    type: Schema.Types.String,
    required: true,
  },
  read: {
    type: Schema.Types.Boolean,
    default: false,
  },
  createdAt: { type: Schema.Types.Date },
});

mongoose.model<NotificationInterface>(
  'notification', NotificationSchema
);
