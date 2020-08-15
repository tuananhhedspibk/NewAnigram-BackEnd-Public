import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
} from 'graphql';

import { FollowType } from './follow_type';
import { PostType } from './post_type';

import * as UserRepository from '../../repositories/user';

export const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    id: { type: GraphQLID },
    email: { type: GraphQLString },
    userName: { type: GraphQLString },
    nickName: { type: GraphQLString },
    gender: { type: GraphQLString },
    avatarURL: { type: GraphQLString },
    posts: {
      type: new GraphQLList(PostType),
      resolve(parentValue) {
        return UserRepository.getPosts(parentValue.id);
      }
    },
    followings: {
      type: new GraphQLList(UserType),
      resolve(parentValue) {
        return UserRepository.getFollowings(parentValue.id);
      }
    },
    followers: {
      type: new GraphQLList(UserType),
      resolve(parentValue) {
        return UserRepository.getFollowers(parentValue.id);
      }
    },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  })
});
