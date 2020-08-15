import { Document } from 'mongoose';

export interface UserInterface extends Document {
  id: string;
  email: string;
  password: string;
  userName: string;
  nickName: string;
  gender: string;
  avatarURL: string;
  posts: PostInterface['id'][];
  followers: FollowInterface['id'][];
  followings: FollowInterface['id'][];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;

  comparePassword: Function;
}

export interface PostInterface extends Document {
  id: string;
  content: string;
  numberLikes: number;
  numberComments: number;
  images: PostImageInterface[];
  tags: string[];
  user: UserInterface['id'];
  comments: CommentInterface['id'][];
  createdAt: Date;
  updatedAt: Date;
}

export interface FollowInterface extends Document {
  id: string;
  follower: UserInterface['id'];
  following: UserInterface['id'];
  createdAt: Date;
}

export interface PostImageInterface {
  source: string;
}

export interface CommentInterface extends Document {
  id: string;
  content: string;
  post: PostInterface['id'];
  user: UserInterface['id'];
  createdAt: Date;
  updatedAt: Date;
}

export interface LikeInterface extends Document {
  id: string;
  user: UserInterface['id'];
  post: PostInterface['id'];
  createdAt: Date;
}

export interface ActiveAccountKeyInterface extends Document {
  id: string;
  user: UserInterface['id'];
  rawValue: string;
  expiredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailySendMailLogInterface extends Document {
  id: string;
  email: string;
  createdAt: Date;
}

export interface NotificationInterface extends Document {
  id: string;
  destUser: UserInterface['id'];
  follower: UserInterface['id'];
  post: PostInterface['id'];
  type: number;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface SuggestFriendDataInterface extends Document {
  id: string;
  avatarURL: string;
  userName: string;
  following: number;
  followers: number;
  posts: number;
}

export interface SuggestFriendInterface extends Document {
  id: string;
  owner: UserInterface['id'];
  users: UserInterface['id'][];
  createdAt: Date;
  updatedAt: Date;
}
