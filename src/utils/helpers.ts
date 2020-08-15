import { LOG_TYPES } from './constants';

export const logger = (
  type: number,
  objectName: string,
  message: string,
) => {
  switch (type) {
    case LOG_TYPES.Info: {
      console.log(`INFO: ${objectName}, Message: `, message);
      break;
    }
    case LOG_TYPES.Error: {
      console.error(`ERROR: ${objectName}, Message: `, message);
      break;
    }
  }
}
