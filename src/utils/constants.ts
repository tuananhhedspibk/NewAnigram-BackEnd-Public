import { PubSub } from 'graphql-subscriptions';

export const IMAGES_SERVER_URL = '';
export const S3_BUCKET_NAME = '';

export const AWS_CONFIG_DATA = {
  accessKeyId: '********************',
  secretAccessKey: '****************************************',
  region: '**-*********-*',
};
export const NO_REPLY_EMAIL = '';
export const SES_CONFIGURES = {};

export const DEFAULT_AVATAR_URL = '';

export const SALT_ROUNDS = 10; // For hash user password algorithm

export const CHARACTERS_CHAIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const ACTIVE_ACCOUNT_KEY_LENGTH = 128;

export const LOG_TYPES = {
  Info: 0,
  Error: 1,
};

export const MAXIMUM_ACTIVE_ACCOUNT_MAILS_IN_DAY = 5;
export const MAX_SUGGEST_USERS_COUNT = 20;

export const SUCCESS_MESSAGES = {
  ActiveAccount: {
    ActiveSuccess: 'Acitve account successfully',
  },
  Auth: {
    SignUpSuccess: 'SignUp successfully',
    SignInSuccess: 'SignIn successfully',
    ComparePassword: 'Password matched',
  },
  Comment: {
    AddCommentSuccess: 'Add comment successfully',
    DeleteCommentSuccess: 'Delete comment successfully',
  },
  Follow: {
    AlreadyFollow: 'Already has followed this user',
    FollowUserSuccess: 'Follow user successfully',
  },
  Notification: {
    MarkAsReadSuccess: 'Mark as read successfully',
    BatchMarkAsReadSuccess: 'Batch mark as read successfully',
  },
  Post: {
    CreatePostSuccess: 'Create post successfully',
    DeletePostSuccess: 'Delete post successfully',
    LikePostSuccess: 'Like post successfully',
    UnlikePostSuccess: 'Unlike post successfully',
  },
  SendActiveEmail: {
    Success: 'Send email successfully',
  },
  SuggestUsers: {
    FetchSuccess: 'Fetch suggest users successfully',
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
  ActiveAccount: {
    ActiveFailed: 'Acitve account failed',
    NotRegisteredOrActivated:
      'You haven\'t not registered an account or your account has been activated',
  },
  Auth: {
    AccountNotExists: 'Account doesnt exist',
    InvalidCredentials: 'Invalid Credentials',
    EmailPassNotMatch: 'Email or Password does not match',
    MustProvideEmailAndPass: 'You must provide an email and password',
    MailInUse: 'Email is already in use',
    Unauthen: 'You haven\'t signed in',
    Unauthorized: 'Unauthorized',
    ComparePassword: 'Password doesn\'t match',
  },
  Comment: {
    AddCommentFailed: 'Add comment failed',
    DeleteCommentFailed: 'Delete comment failed',
  },
  Commons: {
    SystemError: 'System error occured',
  },
  Follow: {
    AlreadyFollow: 'Already has followed this user',
    FollowUserFailed: 'Follow user failed',
    IsFollowingUser: 'Check follow relationship failed',
  },
  Notification: {
    MarkAsReadFailed: 'Mark as read failed',
  },
  Post: {
    AlreadyLikedPost: 'You have already liked this post',
    CreatePostFailed: 'Create post failed',
    DeletePostFailed: 'Delete post failed',
    HaveNotLikedPost: 'You have not liked this post',
    LikePostFailed: 'Like post failed',
    UnlikePostFailed: 'Unlike post failed',
  },
  SendActiveEmail: {
    MaximumMailInDayExceed: 'You can only send maximum 5 "active account emails" in day',
    EmailUnregisteredOrEmailActivated:
      'The account that has this email has been activated or hasn\'t registered yet',
  },
  SuggestUsers: {
    LimitParamGreaterThanMaxCount:
      'Limit parameter \'s value greater than max suggest users count',
  },
  Unfollow: {
    HaveNotFollowed: 'You have not followed this user',
    UnfollowUserFailed: 'Unfollow user failed',
  },
  User: {
    UpdateUserFailed: 'Update user failed',
  },
};

export const SYSTEM_ERROR_MESSAGES = {
  Auth: {
    UserDoesNotExist: 'Error: GraphQL error: Cannot read property \'comparePassword\' of null',
  }
};

export const NotificationTypes = {
  CommentPost: 0,
  LikePost: 1,
  Follow: 2,
};

export const TRIGGER_EVENTS = {
  SignUp: 'SignUp',
  SignIn: 'SignIn',
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
