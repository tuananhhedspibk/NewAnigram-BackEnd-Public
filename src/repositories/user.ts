import { model } from 'mongoose';

import {
  LOG_TYPES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from'../utils/constants';
import { logger } from'../utils/helpers';
import { APIResult } from '../utils/types';

import {
  UserInterface,
  PostInterface,
  FollowInterface,
  NotificationInterface,
} from '../models/interfaces';
import { UserSchema } from '../models/user';
import { PostSchema } from '../models/post';
import { FollowSchema } from '../models/follow';
import { NotificationSchema } from '../models/notification';

import {
  pubsub,
  SUBSCRIPTION_TOPICS,
  NotificationTypes,
} from '../utils/constants';

const User = model<UserInterface>('user', UserSchema);
const Post = model<PostInterface>('post', PostSchema);
const Follow = model<FollowInterface>('follow', FollowSchema);
const Notification = model<NotificationInterface>('notification', NotificationSchema);

export const getById = async (
  id: string,
): Promise<void | UserInterface> => {
  return User.findById(id)
    .catch(err => {
      logger(LOG_TYPES.Error, 'UserRepository.getById', err);
    });
}

export const update = async (
  userId: string,
  updateData: any,
): Promise<APIResult> => {
  return User.findById(userId)
    .then(async (user: any) => {
      for(let [key, value] of Object.entries(updateData)) {
        user[key] = value;
      }

      await user.save();

      return {
        result: true,
        message: SUCCESS_MESSAGES.User.UpdateUserSuccess,
      };
    })
    .catch(err => {
      logger(LOG_TYPES.Error, 'UserRepository.update', err);
      return {
        result: false,
        message: ERROR_MESSAGES.User.UpdateUserFailed,
      };
    });
}

export const follow = async (
  contextUser: UserInterface,
  followingUserId: string,
): Promise<APIResult> => {
  const follows = await Follow.find({
    follower: contextUser._id,
    following: followingUserId,
  });

  if (follows.length > 0) {
    return {
      result: false,
      message: ERROR_MESSAGES.Follow.AlreadyFollow,
    };
  }

  return User.findById(followingUserId)
    .then(async (followUser: any) => {
      const currentTimeStamp = new Date();

      const follow = new Follow({
        follower: contextUser._id,
        following: followingUserId,
        createdAt: currentTimeStamp,
      });

      const notification = new Notification({
        content: `${contextUser.userName} has followed you`,
        image: contextUser.avatarURL,
        destUser: followingUserId,
        follower: contextUser._id,
        type: NotificationTypes.Follow,
        createdAt: currentTimeStamp,
      });

      contextUser.followings.push(followUser.id);
      followUser.followers.push(contextUser._id);

      await Promise.all([,
        contextUser.save(),
        followUser.save(),
        follow.save(),
        notification.save(),
      ]);

      pubsub.publish(
        SUBSCRIPTION_TOPICS.NotificationAdded,
        { notificationAdded: notification },
      );

      return {
        result: true,
        message: SUCCESS_MESSAGES.Follow.FollowUserSuccess,
      };
    })
    .catch(err => {
      logger(LOG_TYPES.Error, 'UserRepository.follow', err);

      return {
        result: false,
        message: ERROR_MESSAGES.Follow.FollowUserFailed,
      };
    });
}

export const unfollow = async (
  contextUser: UserInterface,
  unfollowUserId: string
): Promise<APIResult> => {
  const follows = await Follow.find({
    follower: contextUser._id,
    following: unfollowUserId,
  });

  if (follows.length === 0) {
    return {
      result: false,
      message: ERROR_MESSAGES.Unfollow.HaveNotFollowed
    };
  }

  return User.findById(unfollowUserId)
    .then(async (unfollowUser: any) => {
      const indexOfFollowingUser =
        contextUser.followings.indexOf(unfollowUser.id);
      const indexOfCurrentUser =
        unfollowUser.followers.indexOf(contextUser._id);

      contextUser.followings.splice(indexOfFollowingUser, 1);
      unfollowUser.followers.splice(indexOfCurrentUser, 1);

      await Promise.all([,
        contextUser.save(),
        unfollowUser.save(),
        Follow.deleteOne({
          follower: contextUser._id,
          following: unfollowUserId,
        })
      ]);

      return {
        result: true,
        message: SUCCESS_MESSAGES.Unfollow.UnfollowUserSuccess,
      };
    })
    .catch(err => {
      logger(LOG_TYPES.Error, 'UserRepository.unfollow', err);

      return {
        result: false,
        message: ERROR_MESSAGES.Unfollow.UnfollowUserFailed,
      };
    });
}

export const isFollowingUser = async (
  contextUser: UserInterface,
  partnerUserId: string,
): Promise<APIResult> => {
  return Follow.find({ following: partnerUserId, follower: contextUser.id })
    .then((result: FollowInterface[]) => {
      if (result[0]) {
        return {
          result: true,
          message: SUCCESS_MESSAGES.Follow.AlreadyFollow,
        };
      } else {
        return {
          result: false,
          message: SUCCESS_MESSAGES.Unfollow.HaveNotFollowed,
        };
      }
    })
    .catch(err => {
      logger(LOG_TYPES.Error, 'UserRepository.isFollowingUser', err);

      return {
        result: false,
        message: ERROR_MESSAGES.Follow.IsFollowingUser,
      };
    });
}

export const getFollowings = async (id: string): Promise<UserInterface[]> => {
  return User.findById(id)
    .then(async (user: any) => {
      const userIds = user.followings;

      const getUserTasks = userIds.map((userId: string) =>
        User.findById(userId)
      );

      return Promise.all(getUserTasks)
        .then((users: any) => users);
    })
    .catch(err => {
      logger(LOG_TYPES.Error, 'UserRepository.getFollowings', err);

      return [];
    });
}

export const getFollowers = async (id: string): Promise<UserInterface[]> => {
  return User.findById(id)
    .then(async (user: any) => {
      const userIds = user.followers;

      const getUserTasks = userIds.map((userId: string) =>
        User.findById(userId)
      );

      return Promise.all(getUserTasks)
        .then((users: any) => users);
    })
    .catch(err => {
      logger(LOG_TYPES.Error, 'UserRepository.getFollowers', err);

      return [];
    });
}

export const getPosts = async (userId: string): Promise<PostInterface[]> => {
  return Post.find({ user: userId })
    .then((posts: PostInterface[]) => {
      return posts.sort((a: any, b: any) => (
        b.createdAt - a.createdAt
      ));
    });
}
