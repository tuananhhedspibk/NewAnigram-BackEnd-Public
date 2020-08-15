import {
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { withFilter } from 'apollo-server';

import { NotificationType } from './notification_type';
import { PostType } from './post_type';
import {
  CommentAddedSubscriptionType,
} from './comment_added_subscription_type';
import {
  PostLikeRelateSubscriptionType,
} from './post_like_relate_subscription_type';

import { PostInterface, UserInterface } from '../../models/interfaces';

import * as UserRepository from '../../repositories/user';
import * as PostRepository from '../../repositories/post';

import { SUBSCRIPTION_TOPICS, pubsub } from '../../utils/constants';

export const subscriptions = new GraphQLObjectType({
  name: 'Subscription',
  fields: () => ({
    commentAdded: {
      type: CommentAddedSubscriptionType,
      args: {
        currentUserId: { type: new GraphQLNonNull(GraphQLID) },
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator(SUBSCRIPTION_TOPICS.CommentAdded),
        async (payload, { currentUserId }) => {
          const { commentAdded } = payload;
          const currentPost =
            await PostRepository.getById(commentAdded.postId) as PostInterface;
          const postUser =
            await UserRepository.getById(currentPost.user) as UserInterface;

          return postUser.followers.indexOf(currentUserId.toString()) > -1 ||
            currentUserId.toString() === currentPost.user.toString();
        }
      )
    },
    notificationAdded: {
      type: NotificationType,
      args: { currentUserId: { type: new GraphQLNonNull(GraphQLID) } },
      subscribe: withFilter(
        () => pubsub.asyncIterator(SUBSCRIPTION_TOPICS.NotificationAdded),
        (payload, { currentUserId }) => {
          return payload.notificationAdded.destUser.toString()
            === currentUserId.toString();
        }
      )
    },
    postAdded: {
      type: PostType,
      args: { currentUserId: { type: new GraphQLNonNull(GraphQLID) } },
      subscribe: withFilter(
        () => pubsub.asyncIterator(SUBSCRIPTION_TOPICS.PostAdded),
        async (payload, { currentUserId }) => {
          const currentUser =
            await UserRepository.getById(currentUserId) as any;

          const { postAdded }  = payload;

          return currentUser.followings.indexOf(postAdded.user) > -1
            || currentUser._id.toString() === postAdded.user.toString();
        }
      )
    },
    postLikeRelate: {
      type: PostLikeRelateSubscriptionType,
      args: {
        currentUserId: { type: new GraphQLNonNull(GraphQLID) },
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator(SUBSCRIPTION_TOPICS.PostLikeRelate),
        async (payload, { currentUserId }) => {
          const { postLikeRelate } = payload;
          const currentPost =
            await PostRepository.getById(postLikeRelate.postId) as PostInterface;
          const postUser =
            await UserRepository.getById(currentPost.user) as UserInterface;

          return postUser.followers.indexOf(currentUserId.toString()) > -1 ||
            currentUserId.toString() === currentPost.user.toString();
        }
      )
    },
  })
});
