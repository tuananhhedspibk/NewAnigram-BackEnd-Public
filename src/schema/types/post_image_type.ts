import {
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';

export const PostImageType = new GraphQLObjectType({
  name: 'PostImageType',
  fields: () => ({
    source: { type: GraphQLString },
  })
});
