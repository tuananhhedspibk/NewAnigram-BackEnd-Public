import { model } from 'mongoose';

import {
  LOG_TYPES,
  MAXIMUM_ACTIVE_ACCOUNT_MAILS_IN_DAY,
} from'../utils/constants';
import { logger } from'../utils/helpers';

import { DailySendMailLogSchema } from '../models/dailySendMailLog';
import { DailySendMailLogInterface } from '../models/interfaces';

const DailySendMailLog = model<DailySendMailLogInterface>(
  'dailySendMailLog', DailySendMailLogSchema
);

export const create = async (email: string) => {
  DailySendMailLog.create({
    email,
    createdAt: new Date,
  })
  .catch(err => {
    logger(LOG_TYPES.Error, 'DailySendMailLog.create', err);
  });
}

export const canSendEmailInDay = async (email: string): Promise<boolean> => {
  const currentTime = new Date();
  const oneDayBeforeTime = new Date();

  oneDayBeforeTime.setDate(currentTime.getDate() - 1);

  const dailySendEmailLogs = await DailySendMailLog.find({
    email,
    createdAt: { '$gte': oneDayBeforeTime, '$lt': currentTime }
  });

  if (dailySendEmailLogs.length < MAXIMUM_ACTIVE_ACCOUNT_MAILS_IN_DAY) {
    return true;
  }

  return false;
}
