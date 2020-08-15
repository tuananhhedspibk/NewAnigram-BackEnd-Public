import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
} from 'graphql';
import { model } from 'mongoose';

import { FollowInterface } from '../../models/interfaces';
import { FollowSchema } from '../../models/follow';

const Follow = model<FollowInterface>('follow', FollowSchema);

export const FollowType = new GraphQLObjectType({
  name: 'FollowType',
  fields: () => ({
    id: { type: GraphQLID },
    follower: {
      type: GraphQLID,
      async resolve(parentValue) {
        return Follow.findById(parentValue.id)
          .then((follow: any) => follow.follower)
      }
    },
    following: {
      type: GraphQLID,
      async resolve(parentValue) {
        return Follow.findById(parentValue.id)
          .then((follow: any) => follow.following)
      }
    },
    createdAt: { type: GraphQLString },
  })
});
