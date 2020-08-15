import { model } from 'mongoose';
import { ObjectId } from 'mongodb';

import {
  ERROR_MESSAGES,
  LOG_TYPES,
  SUCCESS_MESSAGES,
  USER_POSTS_BATCH_SIZE,
} from '../utils/constants';
import { logger } from '../utils/helpers';
import { APIResult } from '../utils/types';

import {
  PostInterface,
  CommentInterface,
  UserInterface,
  LikeInterface,
  NotificationInterface,
} from '../models/interfaces';
import { PostSchema } from '../models/post';
import { LikeSchema } from '../models/like';
import { CommentSchema } from '../models/comment';
import { NotificationSchema } from '../models/notification';

import {
  NotificationTypes,
  SUBSCRIPTION_TOPICS,
  pubsub,
} from '../utils/constants';

const Post = model<PostInterface>('post', PostSchema);
const Like = model<LikeInterface>('like', LikeSchema);
const Comment = model<CommentInterface>('comment', CommentSchema);
const Notification = model<NotificationInterface>('notification', NotificationSchema);

export const author = async (
  contextUser: UserInterface,
  postId: string,
): Promise<boolean> => {
  return Post.findById(postId)
    .then((post: PostInterface | null) => {
      if (post) {
        return post.user.toString() === contextUser._id.toString();
      }

      return false;
    })
    .catch(err => {
      logger(LOG_TYPES.Error, 'PostRepository.author', err);

      return false;
    });
}

const sortPostsByCreatedAt = (posts: any, sortDirection: number) => {
  if (sortDirection === 1) {
    posts.sort((a: any, b: any) => (
      b.createdAt - a.createdAt
    ));
  } else if (sortDirection === 0) {
    posts.sort((a : any, b : any) => (
      a.createdAt - b.createdAt
    ));
  }

  return posts;
}

export const indexByUser = async (
  contextUser: UserInterface,
  orderBy: any,
  fromIndex = 0,
): Promise<any> => {
  const getPostTasks = contextUser.followings.map(userId => 
    Post.find({ user: userId })
  );

  getPostTasks.push(
    Post.find({ user: contextUser._id })
  );

  return Promise.all(getPostTasks)
    .then(async results => {
      let allPosts: any = [];
      let postsResult: any = [];
      let canLoadMore = false;

      results.map(result => {
        if (result.length > 0) {
          allPosts = allPosts.concat(result);
        }
      });

      allPosts = sortPostsByCreatedAt(allPosts, orderBy.direction);

      if (fromIndex > allPosts.length - 1) {
        return {
          posts: postsResult,
          canLoadMore,
        };
      } else if (fromIndex + USER_POSTS_BATCH_SIZE > allPosts.length) {
        postsResult = allPosts.slice(
          fromIndex,
          allPosts.length,
        );
      } else {
        postsResult = allPosts.slice(
          fromIndex,
          fromIndex + USER_POSTS_BATCH_SIZE,
        );
        canLoadMore = true;
      }

      const likedPostCheckTasks = postsResult.map(
        (post: any) => (Like.find({
          post: post.id,
          user: contextUser._id
        }))
      );

      await Promise.all(likedPostCheckTasks)
        .then(results => {
          results.forEach((result: any, index: number) => {
            if (result.length === 0) {
              postsResult[index].beLiked = false;
            } else {
              postsResult[index].beLiked = true;
            }
          });
        });

      return {
        posts: postsResult,
        canLoadMore,
      }
    })
    .catch(err => {
      logger(LOG_TYPES.Error, 'PostRepository.indexByUser', err);

      return [];
    });
}

export const create = async (
  id: string,
  content: string,
  images: string[],
  tags: string,
  contextUser: UserInterface,
): Promise<PostInterface | void> => {
  const currentTimeStamp = new Date();

  const postImages = images.map(imgSrc => ({
    source: imgSrc
  }));

  const post = new Post({
    _id: new ObjectId(id),
    content,
    images: postImages,
    tags,
    user: contextUser,
    createdAt: currentTimeStamp,
    updatedAt: currentTimeStamp,
  });
  
  return post.save()
    .then(async result => {
      const post = result;

      contextUser.posts.push(post.id);

      await contextUser.save();

      return post;
    })
    .catch(err => {
      logger(LOG_TYPES.Error, 'PostRepository.create', err);
    });
}

export const getById = async (
  id: string,
  contextUser: any = null,
): Promise<void | PostInterface> => {
  return Post.findById(id)
    .then(async (post: any) => {
      if (contextUser) {
        const res = await Like.find({
          post: id,
          user: contextUser._id
        });

        if (res.length === 1) {
          post.beLiked = true;
        } else {
          post.beLiked = false;
        }
      }

      return post;
    })
    .catch(err => {
      logger(LOG_TYPES.Error, 'PostRepository.getById', err);
    });
}

export const removeById = async (
  id: string,
): Promise<APIResult> => {
  return Post.deleteOne({ _id: id })
    .then(() => ({
      message: SUCCESS_MESSAGES.Post.DeletePostSuccess,
      result: true,
    }))
    .catch(err => {
      logger(LOG_TYPES.Error, 'PostRepository.removeById', err);

      return {
        message: ERROR_MESSAGES.Post.DeletePostFailed,
        result: false,
      }
    });
}

export const like = async (
  postId: string,
  user: UserInterface,
): Promise<APIResult> => {
  return Like.find({ post: postId, user: user.id })
    .then(async (likes: LikeInterface[]) => {
      if (likes.length >= 1) {
        return {
          message: ERROR_MESSAGES.Post.AlreadyLikedPost,
          result: false,
        };
      }
      const post = await Post.findById(postId) as any;

      const currentTimeStamp = new Date();
      const like = new Like({
        post,
        user,
        createdAt: currentTimeStamp,
      });

      post.numberLikes++;

      await Promise.all([
        post.save(),
        like.save(),
      ]);

      pubsub.publish(
        SUBSCRIPTION_TOPICS.PostLikeRelate, {
          postLikeRelate: {
            postNumberLikes: post.numberLikes,
            postId: post._id, 
            srcUserId: user._id,
            beLiked: true,
          }
        }
      );

      if (user._id.toString() !== post.user.toString()) {
        const notification = new Notification({
          content: `${user.userName} has liked your post`,
          image: user.avatarURL,
          destUser: post.user,
          post: postId,
          type: NotificationTypes.LikePost,
          createdAt: currentTimeStamp,
        });

        pubsub.publish(
          SUBSCRIPTION_TOPICS.NotificationAdded,
          { notificationAdded: notification },
        );

        await notification.save();
      }

      return {
        message: SUCCESS_MESSAGES.Post.LikePostSuccess,
        result: true,
      };
    })
    .catch(err => {
      logger(LOG_TYPES.Error, 'PostRepository.like', err);
      return {
        message: ERROR_MESSAGES.Post.LikePostFailed,
        result: false,
      };
    });
}

export const unlike = async (
  postId: string,
  userId: string,
): Promise<APIResult> => {
  return Promise.all([
    Post.findById(postId) as any,
    Like.find({ post: postId, user: userId }),
  ]).then(async ([ post, likes ]) => {
      if (likes.length === 0) {
        return {
          message: ERROR_MESSAGES.Post.HaveNotLikedPost,
          result: false,
        };
      }

      post.numberLikes--;

      await Promise.all([
        post.save(),
        Like.deleteOne({ _id: likes[0]._id }),
      ]);

      pubsub.publish(
        SUBSCRIPTION_TOPICS.PostLikeRelate, {
          postLikeRelate: {
            postNumberLikes: post.numberLikes,
            postId: post._id, 
            srcUserId: userId,
            beLiked: false,
          }
        }
      );

      return {
        message: SUCCESS_MESSAGES.Post.UnlikePostSuccess,
        result: true,
      }; 
    })
    .catch(err => {
      logger(LOG_TYPES.Error, 'PostRepository.unlike', err);

      return {
        message: ERROR_MESSAGES.Post.UnlikePostFailed,
        result: false,
      };
    });
}

export const addComment = async (
  postId: string,
  user: UserInterface,
  commentContent: string,
): Promise<APIResult> => {
  return Post.findById(postId)
    .then(async (post: any) => {
      const currentTimeStamp = new Date();
      const comment = new Comment({
        content: commentContent,
        post,
        user,
        createdAt: currentTimeStamp,
        updatedAt: currentTimeStamp,
      });
      post.comments.push(comment._id);

      await Promise.all([
        post.save(),
        comment.save(),
      ]);

      pubsub.publish(
        SUBSCRIPTION_TOPICS.CommentAdded, {
          commentAdded: {
            comment,
            postId: post._id,
          }
        }
      );

      if (user._id.toString() !== post.user.toString()) {
        const notification = new Notification({
          content: `${user.userName} has commented to your post`,
          image: user.avatarURL,
          destUser: post.user,
          post: postId,
          type: NotificationTypes.CommentPost,
          createdAt: currentTimeStamp,
        });

        await notification.save();

        pubsub.publish(
          SUBSCRIPTION_TOPICS.NotificationAdded,
          { notificationAdded: notification },
        );
      }

      return {
        message: SUCCESS_MESSAGES.Comment.AddCommentSuccess,
        result: true,
      };
    })
    .catch(err => {
      logger(LOG_TYPES.Error, 'PostRepository.addComment', err);

      return {
        message: ERROR_MESSAGES.Comment.AddCommentFailed,
        result: false,
      };
    });
}

export const getComments = async (
  postId: string,
): Promise<CommentInterface[] | void> => {
  return Comment.find({ post: postId })
    .then((comments: CommentInterface[]) => comments)
    .catch(err => {
      logger(LOG_TYPES.Error, 'PostRepository.getComments', err);
    });
}

export const postNumberLikes = async (
  postId: string,
): Promise<number | void> => {
  return Post.findById(postId)
    .then((post: any) => post.numberLikes)
    .catch(err => {
      logger(LOG_TYPES.Error, 'PostRepository.postNumberLike', err);
    });
}

