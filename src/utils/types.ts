import {
  SuggestFriendDataInterface,
  UserInterface,
} from '../models/interfaces';

export interface APIResult {
  message: string;
  result: boolean;
};

export interface AuthenResult {
  user: UserInterface,
  token: string,
  message: string;
  result: boolean;
};

export interface ActiveAccountMail {
  target: string;
  uid: string;
  key: string;
};

export interface SuggestFriendsResult {
  users: SuggestFriendDataInterface[],
  message: string;
  result: boolean;
};

export interface AWSUrl {
  url: string;
  result: boolean;
};
