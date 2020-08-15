import {
  GraphQLID,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLBoolean,
} from 'graphql';

export const PostLikeRelateSubscriptionType = new GraphQLObjectType({
  name: 'PostLikeRelateSubscriptionType',
  fields: () => ({
    postNumberLikes: { type: GraphQLInt },
    postId: { type: GraphQLID }, 
    srcUserId: { type: GraphQLID },
    beLiked: { type: GraphQLBoolean },
  })
});
