import {
  GraphQLID,
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';
import { model } from 'mongoose';

import { PostType } from './post_type';
import { UserType } from './user_type';

import { LikeInterface } from '../../models/interfaces';
import { LikeSchema } from '../../models/like';

const Like = model<LikeInterface>('like', LikeSchema);

export const LikeType = new GraphQLObjectType({
  name: 'LikeType',
  fields: () => ({
    id: { type: GraphQLID },
    user: {
      type: UserType,
      async resolve(parentValue) {
        return Like.findById(parentValue)
          .populate('user')
          .then((like: any) => like.user);
      }
    },
    post: {
      type: PostType,
      async resolve(parentValue) {
        return Like.findById(parentValue)
          .populate('post')
          .then((like: any) => like.post);
      }
    },
    createdAt: { type: GraphQLString },
  }),
});
