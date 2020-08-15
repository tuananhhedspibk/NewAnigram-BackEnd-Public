import mongoose, { Schema } from 'mongoose';

import { SuggestFriendInterface } from './interfaces';

export const SuggestFriendSchema: Schema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  users: {
    type: [ Schema.Types.ObjectId ],
    required: true,
  },
  createdAt: { type: Schema.Types.Date },
  updatedAt: { type: Schema.Types.Date },
});

mongoose.model<SuggestFriendInterface>(
  'suggestfriend',
  SuggestFriendSchema
);
