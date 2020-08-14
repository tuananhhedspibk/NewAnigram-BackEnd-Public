import * as bcrypt from 'bcrypt';
import mongoose, { Schema } from 'mongoose';

import { UserInterface } from './interfaces';
import { DEFAULT_AVATAR_URL, SALT_ROUNDS } from '../utils/constants';

export const UserSchema: Schema = new Schema({
  email: {
    type: Schema.Types.String,
    unique: true,
    required: true,
  },
  password: {
    type: Schema.Types.String,
    required: true,
  },
  userName: {
    type: Schema.Types.String,
    required: true,
  },
  nickName: {
    type: Schema.Types.String,
    required: true,
  },
  gender: {
    type: Schema.Types.String,
    default: 'male',
  },
  avatarURL: {
    type: Schema.Types.String,
    default: DEFAULT_AVATAR_URL,
  },
  active: {
    type: Schema.Types.Boolean,
    default: false,
  },
  posts: [{
    type: Schema.Types.ObjectId,
    required: true,
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    required: true,
  }],
  followings: [{
    type: Schema.Types.ObjectId,
    required: true,
  }],
  createdAt: { type: Schema.Types.Date },
  updatedAt: { type: Schema.Types.Date },
});

UserSchema.pre('save',  function save(next) {
  const user = this as UserInterface;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(SALT_ROUNDS, (err: any, salt: string) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err: any, hash: string) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    })
  });
});

UserSchema.methods.comparePassword =
  function comparePassword (candidatePassword: string) {
    return bcrypt.compareSync(
      candidatePassword, this.password
    );
  };

mongoose.model<UserInterface>('user', UserSchema);
