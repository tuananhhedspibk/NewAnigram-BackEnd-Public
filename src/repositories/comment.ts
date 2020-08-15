import { model } from 'mongoose';

import {
  CommentInterface,
  PostInterface,
} from '../models/interfaces';
import { CommentSchema } from '../models/comment';
import { PostSchema } from '../models/post';

import { APIResult } from '../utils/types';
import {
  LOG_TYPES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from'../utils/constants';
import { logger } from'../utils/helpers';

const Comment = model<CommentInterface>('comment', CommentSchema);
const Post = model<PostInterface>('post', PostSchema);

export const author = async (
  contextUser: any,
  commentId: string
): Promise<boolean> => {
  return Comment.findById(commentId)
    .then((comment: CommentInterface | null) => {
      if (!comment) {
        return false;
      }

      if (comment.user === contextUser.id) {
        return true;
      } else {
        return Post.findById(comment.post)
          .then((post: PostInterface | null) => {
            if (post) {
              return post.user === contextUser.id;
            }

            return false;
          });
      }
    })
    .catch(err => {
      logger(LOG_TYPES.Error, 'CommentRepository.author', err);

      return false;
    });
}

export const removeById = async (
  id: string,
): Promise<APIResult> => {
  return Comment.remove({ _id: id })
    .then(() => ({
      message: SUCCESS_MESSAGES.Comment.DeleteCommentSuccess,
      result: true,
    }))
    .catch(err => {
      logger(LOG_TYPES.Error, 'CommentRepository.removeById', err);

      return {
        message: ERROR_MESSAGES.Comment.DeleteCommentFailed,
        result: false,
      };
    });
}
