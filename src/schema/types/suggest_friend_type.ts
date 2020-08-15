import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
} from 'graphql';

export const SuggestFriendType: GraphQLObjectType = new GraphQLObjectType({
  name: 'SuggestFriendType',
  fields: () => ({
    id: { type: GraphQLID },
    userName: { type: GraphQLString },
    avatarURL: { type: GraphQLString },
    following: { type: GraphQLInt },
    followers: { type: GraphQLInt },
    posts: { type: GraphQLInt },
  })
});
