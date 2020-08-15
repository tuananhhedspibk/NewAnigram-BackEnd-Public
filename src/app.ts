import express from 'express';
import expressGraphQL from 'express-graphql';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import cron from 'node-cron';
import morgan from 'morgan';

import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import { cronJobHandler } from './repositories/suggestFriend';

import {
  MONGODB_URL,
  LOG_TYPES,
  FRONT_END_URL,
  ROUTES,
} from './utils/constants';
import { logger } from './utils/helpers';

import { schema } from './schema/schema';

const models = require('./models');
const app = express();
const corsOptions = {
  origin: FRONT_END_URL,
};

mongoose.Promise = global.Promise;
mongoose.connect(MONGODB_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

mongoose.connection
  .once('open', () =>
    logger(
      LOG_TYPES.Info,
      'mongoose.connection',
      'Connected to MongoDB instance.'
    )
  )
  .on('error', err =>
    logger(LOG_TYPES.Error, 'mongoose.connection', err)
  );

app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get(ROUTES.HealthCheck, (_req, res) => {
  res.send('Healthy server');
});

app.use(ROUTES.GraphQL, expressGraphQL.graphqlHTTP({
  schema,
  graphiql: true
}));

cron.schedule('* */3 * * *', async () => {
  await cronJobHandler();
});

const wrapperServer = createServer(app);

wrapperServer.listen(4000, () => {
  console.log(`Server is now listening on port 4000`);

  new SubscriptionServer({
    execute,
    subscribe,
    schema
  }, {
    server: wrapperServer,
    path: ROUTES.Subscriptions,
  });
});

module.exports = wrapperServer;
