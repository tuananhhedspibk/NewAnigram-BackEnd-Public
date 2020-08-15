import { dropTestDB, closeDBConnection } from './dbDriver';

module.exports = async () => {
  await dropTestDB();
  await closeDBConnection();
}
