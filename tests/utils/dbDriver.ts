import mongoose from 'mongoose';

import { TEST_MONGODB_URL } from './constants';

export const connectToDB = async () => {
  await mongoose.connect(TEST_MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).catch(error => console.error(error));
}

export const dropTestDB = async () => {
  if(process.env.NODE_ENV === 'test'){
    await mongoose.connection.db.dropDatabase()
      .catch(error => console.error(error));
  }
}

export const closeDBConnection = async () => {
  await mongoose.connection.close()
    .catch(error => console.error(error));
}
