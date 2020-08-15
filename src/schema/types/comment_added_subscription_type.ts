import {
  GraphQLID,
  GraphQLObjectType,
} from 'graphql';

import { CommentType } from './comment_type';

export const CommentAddedSubscriptionType = new GraphQLObjectType({
  name: 'CommentAddedSubscriptionType',
  fields: () => ({
    comment: { type: CommentType },
    postId: { type: GraphQLID },
  })
});
