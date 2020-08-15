import {
  GraphQLSchema,
} from 'graphql';
import { createTestClient } from 'apollo-server-testing';
import { ApolloServer } from 'apollo-server';

import { getContext } from './helpers';

import { RootQueryType } from '../../src/schema/types/root_query_type';
import { mutations } from '../../src/schema/types/mutations';
import { subscriptions } from '../../src/schema/types/subscriptions';

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: mutations,
  subscription: subscriptions,
});

const server = new ApolloServer({
  schema,
  mocks: true,
  mockEntireSchema: false,
  context: () => {
    return getContext();
  },
});

export const testClient = createTestClient(server as any);
