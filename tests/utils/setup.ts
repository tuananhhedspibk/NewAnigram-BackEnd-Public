import { connectToDB } from './dbDriver';

module.exports = async () => {
  await connectToDB();
}
