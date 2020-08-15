import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLBoolean,
} from 'graphql';

export const AWSUrlType = new GraphQLObjectType({
  name: 'AWSUrlType',
  fields: () => ({
    url: { type: GraphQLString },
    result: { type: GraphQLBoolean },
  })
});
