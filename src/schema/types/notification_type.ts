import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
} from 'graphql';

export const NotificationType = new GraphQLObjectType({
  name: 'NotificationType',
  fields: () => ({
    id: { type: GraphQLID },
    destUser: { type: GraphQLID },
    follower: { type: GraphQLID },
    post: { type: GraphQLID },
    type: { type: GraphQLInt },
    content: { type: GraphQLString },
    read: { type: GraphQLBoolean },
    image: { type: GraphQLString },
    createdAt: { type: GraphQLString },
  })
});
