import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
} from 'graphql';
import { model } from 'mongoose';

import { PostType } from './post_type';
import { UserType } from './user_type';

import { CommentInterface, UserInterface } from '../../models/interfaces';
import { CommentSchema } from '../../models/comment';
import { UserSchema } from '../../models/user';

const Comment = model<CommentInterface>('comment', CommentSchema);
const User = model<UserInterface>('user', UserSchema);

export const CommentType = new GraphQLObjectType({
  name: 'CommentType',
  fields: () => ({
    id: { type: GraphQLID },
    content: { type: GraphQLString },
    post: {
      type: PostType,
      async resolve(parentValue) {
        return Comment.findById(parentValue.id)
          .then((comment: any) => comment.post);
      }
    },
    user: {
      type: UserType,
      async resolve(parentValue) {
        return Comment.findById(parentValue.id)
          .then(async (comment: any) => {
            const user = await User.findById(comment.user) as any;

            return {
              id: user.id,
              userName: user.userName,
              avatarURL: user.avatarURL,
            };
          });
      }
    },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  })
});
