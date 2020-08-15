import { model } from 'mongoose';

import {
  ActiveAccountKeyInterface,
  UserInterface,
} from '../models/interfaces';
import { ActiveAccountKeySchema }
  from '../models/activeAccountKey';

import { logger, randomString } from '../utils/helpers';
import { LOG_TYPES, ACTIVE_ACCOUNT_KEY_LENGTH } from '../utils/constants';

const ActiveAccountKey = model<ActiveAccountKeyInterface>(
  'activeAccountKey',
  ActiveAccountKeySchema,
);

export const create = async (
  contextUser: UserInterface
): Promise<string | void> => {
  const rawValue = randomString(ACTIVE_ACCOUNT_KEY_LENGTH);

  const currentTimeStamp = new Date();
  const expiredAt = currentTimeStamp;

  expiredAt.setDate(expiredAt.getDate() + 1);

  return ActiveAccountKey.create({
    user: contextUser.id,
    rawValue,
    expiredAt,
    createdAt: currentTimeStamp,
    updatedAt: currentTimeStamp,
  })
  .then(() => {
    return rawValue;
  })
  .catch(err => {
    logger(LOG_TYPES.Error, 'ActiveAccountKeyRepository.create', err);
  });
}
