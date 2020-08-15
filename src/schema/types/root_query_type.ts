import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLString,
} from 'graphql';

import { APIResultType } from './api_result_type';
import { FetchPostsType } from './fetch_posts_type';
import { NotificationType } from './notification_type';
import { PostType } from './post_type';
import { SugguestFriendsResultType } from './suggest_friends_result_type';
import { UserType } from './user_type';

import { OrderByFields } from './order_by_fields';

import * as AuthRepository from '../../repositories/authentication/auth';
import * as PostRepository from '../../repositories/post';
import * as UserRepository from '../../repositories/user';
import * as NotificationRepository from '../../repositories/notification';
import * as SuggestFriendRepository from '../../repositories/suggestFriend';

import { ERROR_MESSAGES } from '../../utils/constants';

export const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_parentValue, { id }, context) {
        const user = await AuthRepository.authenticate(
          context.headers.authorization
        );

        if (user) {
          if (user._id === id) {
            return user;
          } else {
            return UserRepository.getById(id);
          }
        } else {
          throw new Error(ERROR_MESSAGES.Auth.Unauthen);
        }
      }
    },
    post: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      async resolve(_parentValue, { id }, context) {
        const user = await AuthRepository.authenticate(
          context.headers.authorization
        );

        if (user) {
          return PostRepository.getById(id, user);
        } else {
          throw new Error(ERROR_MESSAGES.Auth.Unauthen);
        }
      }
    },
    fetchPosts: {
      type: FetchPostsType,
      args: {
        orderBy: { type: new GraphQLInputObjectType(OrderByFields) },
        fromIndex: { type: GraphQLInt },
      },
      async resolve(_parentValue, { orderBy, fromIndex }, context) {
        const user = await AuthRepository.authenticate(
          context.headers.authorization
        );

        if (user) {
          return PostRepository.indexByUser(user, orderBy, fromIndex);
        } else {
          throw new Error(ERROR_MESSAGES.Auth.Unauthen);
        }
      }
    },
    notifications: {
      type: new GraphQLList(NotificationType),
      args: {},
      async resolve(_parentValue, {}, context) {
        const user = await AuthRepository.authenticate(
          context.headers.authorization
        );

        if (user) {
          return NotificationRepository.indexByUser(user);
        } else {
          throw new Error(ERROR_MESSAGES.Auth.Unauthen);
        }
      }
    },
    confirmPassword: {
      type: APIResultType,
      args: { candidatePassword: { type: new GraphQLNonNull(GraphQLString) } },
      async resolve(_parentValue, { candidatePassword }, context) {
        let contextUser = null;

        try {
          contextUser = await AuthRepository.authenticate(context.headers.authorization);
        } catch (err) {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthen,
          };
        }

        return AuthRepository.confirmPassword(contextUser, candidatePassword);
      }
    },
    isFollowingUser: {
      type: APIResultType,
      args: { userId: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_parentValue, { userId }, context) {
        let contextUser = null;

        try {
          contextUser = await AuthRepository.authenticate(context.headers.authorization);
        } catch (err) {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthen,
          };
        }

        return UserRepository.isFollowingUser(contextUser, userId);
      }
    },
    suggestFriends: {
      type: SugguestFriendsResultType,
      args: { limit: { type: GraphQLInt } },
      async resolve(_parentValue, { limit }, context) {
        let contextUser = null;

        try {
          contextUser = await AuthRepository.authenticate(context.headers.authorization);
        } catch (err) {
          return {
            message: ERROR_MESSAGES.Auth.Unauthen,
            result: false,
            users: [],
          };
        }

        return SuggestFriendRepository.get(contextUser, limit);
      }
    }
  })
});
