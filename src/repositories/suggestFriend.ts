import { model } from 'mongoose';

import {
  SuggestFriendInterface,
  SuggestFriendDataInterface,
  UserInterface,
} from '../models/interfaces';
import { SuggestFriendSchema } from '../models/suggestFriend';
import { UserSchema } from '../models/user';

import {
  APIResult,
  SuggestFriendsResult,
} from '../utils/types';

import { logger } from '../utils/helpers';
import {
  ERROR_MESSAGES,
  LOG_TYPES,
  MAX_SUGGEST_USERS_COUNT,
  SUCCESS_MESSAGES,
} from '../utils/constants';

import * as UserRepository from './user';

const SuggestFriend = model<SuggestFriendInterface>(
  'suggestfriend', SuggestFriendSchema
);
const User = model<UserInterface>('user', UserSchema);

export const create = async (
  ownerId: string
) => {
  const currentTimeStamp = new Date();
  const suggestUsers: string[] = [];
  const allUsers = await User.find({});

  for (let i in allUsers) {
    if (allUsers[i]._id.toString() !== ownerId.toString()) {
      suggestUsers.push(allUsers[i]._id.toString());
    }
    if (suggestUsers.length === MAX_SUGGEST_USERS_COUNT) {
      break;
    }
  }

  return SuggestFriend.create({
    owner: ownerId,
    users: suggestUsers,
    createdAt: currentTimeStamp,
    updatedAt: currentTimeStamp,
  })
  .catch(err => {
    logger(
      LOG_TYPES.Error,
      'SuggestFriendRepository.create',
      err,
    );
  });
}

export const get = async (
  contextUser: UserInterface,
  limit = MAX_SUGGEST_USERS_COUNT,
): Promise<SuggestFriendsResult> => {
  if (limit > MAX_SUGGEST_USERS_COUNT) {
    return {
      users: [],
      message:
        ERROR_MESSAGES.SuggestUsers.LimitParamGreaterThanMaxCount,
      result: false,
    };
  }

  return SuggestFriend.find({ owner: contextUser._id })
    .then((results: SuggestFriendInterface[]) => {
      const suggestFriendIds = results[0].users;
      const getUserTasks = suggestFriendIds.map(id => 
        User.findById(id)
      );

      return Promise.all(getUserTasks)
        .then(async (users: any) => {
          const getFollowingStatusTasks = users.map((user: any) => 
            UserRepository.isFollowingUser(contextUser, user._id)
          );
          let suggestFriendsData:
            SuggestFriendDataInterface[] = [];

          await Promise.all(getFollowingStatusTasks)
            .then((followingStatuses: any) => {
              followingStatuses.forEach((status: any, index: number) => {
                if (!status.result) {
                  const userData = users[index];

                  suggestFriendsData.push({
                    id: userData._id,
                    userName: userData.userName,
                    avatarURL: userData.avatarURL,
                    followers: userData.followers.length,
                    following: userData.followings.length,
                    posts: userData.posts.length,
                  } as SuggestFriendDataInterface);
                }
              });
            });

          if (limit < suggestFriendsData.length) {
            suggestFriendsData = suggestFriendsData.slice(0, limit);
          }

          return {
            users: suggestFriendsData,
            message: SUCCESS_MESSAGES.SuggestUsers.FetchSuccess,
            result: true,
          };
        });
    })
    .catch(err => {
      logger(
        LOG_TYPES.Error,
        'SuggestFriendRepository.get',
        err,
      );

      return {
        users: [],
        message: ERROR_MESSAGES.Commons.SystemError,
        result: false,
      };
    });
}

export const update = async (
  ownerId: string
) => {
  return SuggestFriend.find({ owner: ownerId })
    .then(async (results: SuggestFriendInterface[]) => {
      const user = await User.findById(ownerId);
      const userFollowers = await UserRepository.getFollowers(ownerId);

      const suggestFriendUsers: string[] = [];
      const sgFriendInstance = results[0];

      const getFollowingStatusTasks = userFollowers.map(follower => 
        UserRepository.isFollowingUser(user as UserInterface, follower._id)
      );

      await Promise.all(getFollowingStatusTasks)
        .then((followingStatuses: APIResult[]) => {
          followingStatuses.forEach((status, index) => {
            if (!status.result) {
              suggestFriendUsers.push(userFollowers[index]._id.toString());
            }
          });
        });

      if (suggestFriendUsers.length < MAX_SUGGEST_USERS_COUNT) {
        const users = await User.find({});

        for (let i in users) {
          if (suggestFriendUsers.indexOf(users[i]._id.toString()) === -1
            && users[i]._id.toString() !== ownerId.toString()
          ) {
            const res = await UserRepository.isFollowingUser(
              user as UserInterface, users[i]._id
            );
            if (!res.result) {
              suggestFriendUsers.push(users[i]._id.toString());
            }
          }
          if (suggestFriendUsers.length === MAX_SUGGEST_USERS_COUNT) {
            break;
          }
        }
      }

      sgFriendInstance.users = suggestFriendUsers;
      sgFriendInstance.updatedAt = new Date();

      return sgFriendInstance.save();
    })
    .catch(err => {
      logger(
        LOG_TYPES.Error,
        'SuggestFriendRepository.update',
        err,
      );
    });
}

export const cronJobHandler = async () => {
  const users = await User.find({});
  const tasks = users.map(user => update(user._id));

  return Promise.all(tasks)
    .catch(err => {
      logger(
        LOG_TYPES.Error,
        'SuggestFriendRepository.cronJobHandler',
        err,
      );
    });
}
