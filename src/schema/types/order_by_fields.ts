import {
  GraphQLString,
  GraphQLEnumType,
} from 'graphql';

const OrderEnumType = new GraphQLEnumType({
  name: 'OrderEnumType',
  values: {
    asc: { value: 0 },
    desc: { value: 1 }
  }
});

export const OrderByFields = {
  name: 'OrderByType',
  fields: () => ({
    field: { type: GraphQLString },
    direction: { type: OrderEnumType },
  })
};
