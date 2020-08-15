import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLBoolean
} from 'graphql';

import { UserType } from './user_type';

export const AuthenResultType = new GraphQLObjectType({
  name: 'AuthenResultType',
  fields: () => ({
    user: { type: UserType },
    token: { type: GraphQLString },
    message: { type: GraphQLString },
    result: { type: GraphQLBoolean },
  })
});
