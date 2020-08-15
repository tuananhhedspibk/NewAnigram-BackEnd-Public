import { PubSub } from 'graphql-subscriptions';

export const AWS_CONFIG_DATA = {
  accessKeyId: '********************',
  secretAccessKey: '****************************************',
  region: '**-*********-*',
};

export const IMAGES_SERVER_URL = '';
export const S3_BUCKET_NAME = '';

export const DEFAULT_AVATAR_URL = '';

export const SALT_ROUNDS = 10; // For hash user password algorithm

export const LOG_TYPES = {
  Info: 0,
  Error: 1,
};

export const SUCCESS_MESSAGES = {
  Comment: {
    AddCommentSuccess: 'Add comment successfully',
    DeleteCommentSuccess: 'Delete comment successfully',
  },
  Follow: {
    AlreadyFollow: 'Already has followed this user',
    FollowUserSuccess: 'Follow user successfully',
  },
  Post: {
    CreatePostSuccess: 'Create post successfully',
    DeletePostSuccess: 'Delete post successfully',
    LikePostSuccess: 'Like post successfully',
    UnlikePostSuccess: 'Unlike post successfully',
  },
  Unfollow: {
    HaveNotFollowed: 'You have not followed this user',
    UnfollowUserSuccess: 'Unfollow user successfully',
  },
  User: {
    UpdateUserSuccess: 'Update user successfully',
  },
};

export const ERROR_MESSAGES = {
  Comment: {
    AddCommentFailed: 'Add comment failed',
    DeleteCommentFailed: 'Delete comment failed',
  },
  Follow: {
    AlreadyFollow: 'Already has followed this user',
    FollowUserFailed: 'Follow user failed',
    IsFollowingUser: 'Check follow relationship failed',
  },
  Post: {
    AlreadyLikedPost: 'You have already liked this post',
    CreatePostFailed: 'Create post failed',
    DeletePostFailed: 'Delete post failed',
    HaveNotLikedPost: 'You have not liked this post',
    LikePostFailed: 'Like post failed',
    UnlikePostFailed: 'Unlike post failed',
  },
  Unfollow: {
    HaveNotFollowed: 'You have not followed this user',
    UnfollowUserFailed: 'Unfollow user failed',
  },
  User: {
    UpdateUserFailed: 'Update user failed',
  },
};

export const NotificationTypes = {
  CommentPost: 0,
  LikePost: 1,
  Follow: 2,
};

export const SUBSCRIPTION_TOPICS = {
  CommentAdded: 'CommentAdded',
  NotificationAdded: 'NotificationAdded',
  PostAdded: 'PostAdded',
  PostDeleted: 'PostDeleted',
  PostLikeRelate: 'PostLikeRelate',
};

export const USER_POSTS_BATCH_SIZE = 9;

export const pubsub = new PubSub();
