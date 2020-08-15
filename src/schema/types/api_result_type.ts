import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLBoolean,
} from 'graphql';

export const APIResultType = new GraphQLObjectType({
  name: 'APIResultType',
  fields: () => ({
    message: { type: GraphQLString },
    result: { type: GraphQLBoolean },
  })
});
