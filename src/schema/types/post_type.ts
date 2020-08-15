import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
} from 'graphql';
import { model } from 'mongoose';

import { UserType } from './user_type';
import { CommentType } from './comment_type';
import { PostImageType } from './post_image_type';

import { PostInterface, UserInterface, } from '../../models/interfaces';
import * as PostRepository from '../../repositories/post';

import { PostSchema } from '../../models/post';
import { UserSchema } from '../../models/user';

const Post = model<PostInterface>('post', PostSchema);
const User = model<UserInterface>('user', UserSchema);

export const PostType: GraphQLObjectType = new GraphQLObjectType({
  name: 'PostType',
  fields: () => ({
    id: { type: GraphQLID },
    content: { type: GraphQLString },
    numberLikes: { type: GraphQLInt },
    numberComments: { type: GraphQLInt },
    tags: { type: new GraphQLList(GraphQLString) },
    images: { type: new GraphQLList(PostImageType) },
    user: {
      type: UserType,
      async resolve(parentValue) {
        return Post.findById(parentValue._id)
          .then((post: any) => 
            User.findById(post.user)
          );
      }
    },
    comments: {
      type: new GraphQLList(CommentType),
      resolve(parentValue) {
        return PostRepository.getComments(parentValue.id);
      }
    },
    beLiked: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  })
});
