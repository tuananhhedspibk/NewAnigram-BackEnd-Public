import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { SuggestFriendType } from './suggest_friend_type';

export const SugguestFriendsResultType = new GraphQLObjectType({
  name: 'SugguestFriendsResultType',
  fields: () => ({
    users: { type: GraphQLList(SuggestFriendType) },
    message: { type: GraphQLString },
    result: { type: GraphQLBoolean },
  })
});
