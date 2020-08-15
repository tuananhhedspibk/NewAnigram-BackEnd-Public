import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';

import {
  generateGetURL,
  generatePutURL,
} from '../../utils/awsPresigner';

import {
  ERROR_MESSAGES,
  SUBSCRIPTION_TOPICS,
  pubsub,
  SUCCESS_MESSAGES,
} from '../../utils/constants';

import { APIResultType } from './api_result_type';
import { AuthenResultType } from './authen_result_type';
import { AWSUrlType } from './aws_url_type';

import * as AuthRepository from '../../repositories/authentication/auth';
import * as CommentRepository from '../../repositories/comment';
import * as PostRepository from '../../repositories/post';
import * as UserRepository from '../../repositories/user';
import * as NotificationRepository from '../../repositories/notification';

export const mutations = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    activeAccount: {
      type: AuthenResultType,
      args: {
        uid: { type: new GraphQLNonNull(GraphQLID) },
        key: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(_parentValue, { uid, key }, _context) {
        return AuthRepository.activeAccount(uid, key);
      },
    },
    s3GetURL: {
      type: AWSUrlType,
      args: { key: { type: new GraphQLNonNull(GraphQLString) } },
      async resolve(_parentValue, { key }, context) {
        try {
          await AuthRepository.authenticate(context.headers.authorization);
        } catch (err) {
          return {
            result: false,
            url: '',
          };
        }

        return generateGetURL(key);
      }
    },
    s3PutURL: {
      type: AWSUrlType,
      args: {
        key: { type: new GraphQLNonNull(GraphQLString) },
        contentType: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(_parentValue, { key, contentType }, context) {
        try {
          await AuthRepository.authenticate(context.headers.authorization);
        } catch (err) {
          return {
            result: false,
            url: '',
          };
        }

        return generatePutURL(key, contentType);
      }
    },
    signUp: {
      type: AuthenResultType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve(_parentValue, { email, password }) {
        return AuthRepository.signUp(
          email,
          password,
        );
      }
    },
    signIn: {
      type: AuthenResultType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      async resolve(_parentValue, { email, password }) {
        return AuthRepository.signIn(
          email,
          password,
        );
      }
    },
    createPost: {
      type: APIResultType,
      args: {
        id: { type: GraphQLString },
        content: { type: GraphQLString },
        tags: { type: new GraphQLList(GraphQLString) },
        images: { type: new GraphQLList(GraphQLString) },
      },
      async resolve(_parentValue, { id, content, images, tags }, context) {
        let contextUser = null;

        try {
          contextUser =
            await AuthRepository.authenticate(context.headers.authorization);
        } catch (err) {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthen,
          };
        }

        try {
          const newPost =
            await PostRepository.create(id, content, images, tags, contextUser);

          pubsub.publish(
            SUBSCRIPTION_TOPICS.PostAdded,
            { postAdded: newPost }
          );

          return {
            message: SUCCESS_MESSAGES.Post.CreatePostSuccess,
            result: true,
          };
        } catch (err) {
          return {
            message: ERROR_MESSAGES.Post.CreatePostFailed,
            result: false,
          };
        }
      }
    },
    commentPost: {
      type: APIResultType,
      args: {
        postId: { type: new GraphQLNonNull(GraphQLID) },
        commentContent: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(
        _parentValue, { postId, commentContent }, context
      ) {
        let contextUser = null;

        try {
          contextUser =
            await AuthRepository.authenticate(context.headers.authorization);
        } catch (err) {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthen,
          };
        }

        return PostRepository.addComment(postId, contextUser, commentContent);        
      }
    },
    deleteComment: {
      type: APIResultType,
      args: {
        id: { type: GraphQLID },
      },
      async resolve(_parentValue, { id }, context) {
        let contextUser = null;

        try {
          contextUser =
            await AuthRepository.authenticate(context.headers.authorization);
        } catch (err) {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthen,
          };
        }

        if (CommentRepository.author(contextUser, id)) {
          return CommentRepository.removeById(id);
        } else {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthorized,
          };
        }
      }
    },
    deletePost: {
      type: APIResultType,
      args: {
        id: { type: GraphQLID },
      },
      async resolve(_parentValue, { id }, context) {
        let contextUser = null;

        try {
          contextUser =
            await AuthRepository.authenticate(context.headers.authorization);
        } catch (err) {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthen,
          };
        }

        if (PostRepository.author(contextUser, id)) {
          return PostRepository.removeById(id);
        } else {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthorized,
          };
        }        
      }
    },
    likePost: {
      type: APIResultType,
      args: {
        postId: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(_parentValue, { postId }, context) {
        let contextUser = null;

        try {
          contextUser =
            await AuthRepository.authenticate(context.headers.authorization);
        } catch (err) {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthen,
          };
        }

        return PostRepository.like(postId, contextUser);
      }
    },
    unlikePost: {
      type: APIResultType,
      args: {
        postId: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(_parentValue, { postId }, context) {
        let contextUser = null;

        try {
          contextUser = await AuthRepository.authenticate(context.headers.authorization);
        } catch (err) {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthen,
          };
        }

        return PostRepository.unlike(postId, contextUser._id);
      }
    },
    followUser: {
      type: APIResultType,
      args: {
        followingUserId: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(_parentValue, { followingUserId }, context) {
        let contextUser = null;

        try {
          contextUser = await AuthRepository.authenticate(context.headers.authorization);
        } catch (err) {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthen,
          };
        }

        return UserRepository.follow(
          contextUser,
          followingUserId,
        );
      }
    },
    unfollowUser: {
      type: APIResultType,
      args: {
        unfollowUserId: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(_parentValue, { unfollowUserId }, context) {
        let contextUser = null;

        try {
          contextUser = await AuthRepository.authenticate(context.headers.authorization);
        } catch (err) {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthen,
          };
        }

        return UserRepository.unfollow(contextUser, unfollowUserId);
      }
    },
    updateUser: {
      type: APIResultType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        avatarURL: { type: GraphQLString },
        userName: { type: GraphQLString },
        nickName: { type: GraphQLString },
      },
      async resolve(_parentValue, {
        id, email, password, avatarURL, userName, nickName
      }, context) {
        let contextUser = null;

        try {
          contextUser = await AuthRepository.authenticate(context.headers.authorization);
        } catch (err) {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthen,
          };
        }

        const updateData: any = {};

        if (email !== undefined && email !== '') {
          updateData.email = email;
        }
        if (password !== undefined && password !== '') {
          updateData.password = password;
        }
        if (avatarURL !== undefined && avatarURL !== '') {
          updateData.avatarURL = avatarURL;
        }
        if (userName !== undefined && userName !== '') {
          updateData.userName = userName;
        }
        if (nickName !== undefined && nickName !== '') {
          updateData.nickName = nickName;
        }

        if (contextUser) {
          if (contextUser._id.toString() === id) {
            return UserRepository.update(id, updateData);
          } else {
            return {
              result: false,
              message: ERROR_MESSAGES.Auth.Unauthorized,
            }
          }
        } else {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthen,
          }
        }
      }
    },
    markNotificationAsRead: {
      type: APIResultType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(_parentValue, { id }, context) {
        let contextUser = null;

        try {
          contextUser = await AuthRepository.authenticate(context.headers.authorization);
        } catch (err) {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthen,
          };
        }

        const checkAuthorResult =
          await NotificationRepository.author(contextUser, id);

        if (checkAuthorResult) {
          return NotificationRepository.markAsRead(id);
        } else {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthorized,
          };
        }
      }
    },
    markNotificationAsReadByBatch: {
      type: APIResultType,
      args: {
        ids: { type: new GraphQLList(GraphQLID) },
      },
      async resolve(_parentValue, { ids }, context) {
        let contextUser: any = null;

        try {
          contextUser = await AuthRepository.authenticate(context.headers.authorization);
        } catch (err) {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthen,
          };
        }
         
        let author = true;

        const checkAuthorTasks = ids.map((id: string) => 
          NotificationRepository.author(contextUser, id)
        );

        await Promise.all(checkAuthorTasks)
          .then(results => {
            results.forEach(res => {
              if (!res && author) {
                author = false;
              }
            });
          });

        if (author) {
          return NotificationRepository.markAsReadByBatch(ids);
        } else {
          return {
            result: false,
            message: ERROR_MESSAGES.Auth.Unauthorized,
          };
        }
      }
    },
    sendActiveAccountEmail: {
      type: APIResultType,
      args: { email: { type: new GraphQLNonNull(GraphQLString) } },
      async resolve(_parentValue, { email }, _context) {
        return AuthRepository.sendActiveAccountEmailResolver(email);
      }
    },
  })
});
