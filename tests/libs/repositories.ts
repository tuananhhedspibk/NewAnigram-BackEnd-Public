import { model } from 'mongoose';
import { ObjectId } from 'mongodb';

import {
  ActiveAccountKeyInterface,
  CommentInterface,
  DailySendMailLogInterface,
  FollowInterface,
  LikeInterface,
  NotificationInterface,
  PostInterface,
  SuggestFriendInterface,
  UserInterface,
} from '../../src/models/interfaces';
import {
  ActiveAccountKeySchema,
  CommentSchema,
  DailySendMailLogSchema,
  FollowSchema,
  LikeSchema,
  NotificationSchema,
  PostSchema,
  SuggestFriendSchema,
  UserSchema,
} from '../../src/models/index';

import { DEFAULT_EMAIL, DEFAULT_PASSWORD } from '../utils/constants';

class BaseRepository {
  protected modelInstance: any;
  
  getById = async (id: string) => {
    const result = await this.modelInstance.findById(id)

    return result;
  }

  getByAttributes = async (attrsData: any) => {
    const findCondition: any = {};

    attrsData.forEach((attr: any) => {
      findCondition[attr.key] = attr.value;
    });

    const results = await this.modelInstance.find(findCondition);

    return results;
  }
}

export class ActiveAccountKeyRepository extends BaseRepository {
  constructor() {
    super();
    this.modelInstance = model<ActiveAccountKeyInterface>(
      'activeaccountkey', ActiveAccountKeySchema
    );
  }
}

export class CommentRepository extends BaseRepository {
  constructor() {
    super();
    this.modelInstance = model<CommentInterface>(
      'comment', CommentSchema
    );
  }
}

export class DailySendMailLogRepository extends BaseRepository {
  constructor() {
    super();
    this.modelInstance = model<DailySendMailLogInterface>(
      'dailysendmaillog', DailySendMailLogSchema
    );
  }
}

export class FollowRepository extends BaseRepository {
  constructor() {
    super();
    this.modelInstance = model<FollowInterface>(
      'follow', FollowSchema
    );
  }

  create = async (
    currentUser: UserInterface,
    followingUser: UserInterface
  ): Promise<void> => {
    const currentTimeStamp = new Date();
    const follow = new this.modelInstance({
      follower: currentUser._id,
      following: followingUser._id,
      createdAt: currentTimeStamp,
    });

    currentUser.followings.push(followingUser._id);
    followingUser.followers.push(currentUser._id);

    await Promise.all([
      follow.save(),
      currentUser.save(),
      followingUser.save(),
    ]).catch((err: any) => console.error(err));
  }
}

export class LikeRepository extends BaseRepository {
  constructor() {
    super();
    this.modelInstance = model<LikeInterface>(
      'like', LikeSchema
    );
  }

  create = async (post: PostInterface, user: UserInterface): Promise<void> => {
    const currentTimeStamp = new Date();
    const like = new this.modelInstance({
      post,
      user,
      createdAt: currentTimeStamp,
    });

    post.numberLikes++;

    await Promise.all([
      like.save(),
      post.save()
    ]).catch(err => console.log(err));
  }
}

export class NotificationRepository extends BaseRepository {
  constructor() {
    super();
    this.modelInstance = model<NotificationInterface>(
      'notification', NotificationSchema,
    );
  }

  create = async (
    destUser: UserInterface,
    content: string,
    type: number,
  ): Promise<NotificationInterface> => {
    const notification = new this.modelInstance({
      destUser,
      content,
      type
    });

    await notification.save()
      .catch((err: any) => console.error(err));

    return notification;
  }
}

export class PostRepository extends BaseRepository {
  constructor() {
    super();
    this.modelInstance = model<PostInterface>(
      'post', PostSchema
    );
  }

  create = async (data: any, postUser: UserInterface): Promise<PostInterface> => {
    const currentTimeStamp = new Date();
    const post = new this.modelInstance({
      _id: data.id,
      content: data.content,
      images: data.images,
      tags: data.tags,
      user: postUser,
      createdAt: currentTimeStamp,
      updatedAt: currentTimeStamp,
    });

    postUser.posts.push(data.id);

    await Promise.all([
      post.save(),
      postUser.save()
    ]).catch(err => console.error(err));

    return post;
  }
}

export class SuggestFriendRepository extends BaseRepository{
  constructor() {
    super();
    this.modelInstance = model<SuggestFriendInterface>(
      'suggestfriend', SuggestFriendSchema
    );
  }

  create = async (
    ownerId: string,
    suggestUsers: [ObjectId]
  ): Promise<SuggestFriendInterface> => {
    const currentTimeStamp = new Date();
    const suggestFriends = new this.modelInstance({
      owner: ownerId,
      users: suggestUsers,
      createdAt: currentTimeStamp,
      updatedAt: currentTimeStamp,
    });

    await suggestFriends.save();

    return suggestFriends;
  }
}

export class UserRepository extends BaseRepository {
  constructor() {
    super();
    this.modelInstance = model<UserInterface>(
      'user', UserSchema
    );
  }

  create = async (
    email=DEFAULT_EMAIL,
    password=DEFAULT_PASSWORD,
  ): Promise<UserInterface> => {
    const currentTimeStamp = new Date();
    const user = new this.modelInstance({
      email,
      password,
      active: true,
      userName: email,
      nickName: email,
      createdAt: currentTimeStamp,
      updatedAt: currentTimeStamp,
    });

    await user.save()
      .catch((err: any) => console.error(err));

    user.password = password;

    return user;
  }
}
