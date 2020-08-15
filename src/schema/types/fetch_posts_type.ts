import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLObjectType,
} from 'graphql';

import { PostType } from './post_type';

export const FetchPostsType = new GraphQLObjectType({
  name: 'FetchPostsType',
  fields: () => ({
    posts: { type: new GraphQLList(PostType) },
    canLoadMore: { type: GraphQLBoolean },
  })
});
