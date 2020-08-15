import { model } from 'mongoose';

import { LOG_TYPES } from'../utils/constants';
import { logger } from'../utils/helpers';

import {
  NotificationInterface,
} from '../models/interfaces';

import { NotificationSchema } from '../models/notification';

import { APIResult } from '../utils/types';

import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../utils/constants';

const Notification = model<NotificationInterface>(
  'notification', NotificationSchema
);

export const author = async (
  contextUser: any,
  notificationId: string,
): Promise<boolean> => {
  return Notification.findById(notificationId)
    .then((notification: NotificationInterface | null) => {
      if (notification) {
        notification.destUser.toString() === contextUser._id.toString();
      }

      return false;
    })
    .catch(err => {
      logger(
        LOG_TYPES.Error,
        'NotificationRepository.author',
        err
      );

      return false;
    });
}

export const indexByUser = async (
  contextUser: any,
): Promise<any> => {
  return Notification.find({ destUser: contextUser._id })
    .then((notifications: NotificationInterface[]) => {
      notifications.sort((a: any, b: any) => (
        b.createdAt - a.createdAt
      ));

      return notifications;
    })
    .catch(err => {
      logger(
        LOG_TYPES.Error,
        'NotificationRepository.indexByUser',
        err
      );

      return [];
    });
}

export const markAsRead = async (
  notificationId: string,
): Promise<APIResult> => {
  return Notification.findById(notificationId)
    .then(async (notification: any) => {
      if (!notification.read) {
        notification.read = true;

        await notification.save();
      }

      return {
        message: SUCCESS_MESSAGES.Notification.MarkAsReadSuccess,
        result: true,
      };
    })
    .catch(err => {
      logger(
        LOG_TYPES.Error,
        'NotificationRepository.markAsRead',
        err
      );

      return {
        message: ERROR_MESSAGES.Notification.MarkAsReadFailed,
        result: false,
      };
    });
}

export const markAsReadByBatch = async (
  ids: [string],
): Promise<APIResult> => {
  const getNotificationTasks = ids.map((id: string) => (
    Notification.findById(id)
  ));

  return Promise.all(getNotificationTasks)
    .then(async notifications => {
      const updateNotifiTasks = notifications.map((notifi: any) => {
        notifi.read = true;

        return notifi.save()
      });
      
      await Promise.all(updateNotifiTasks);

      return {
        message: SUCCESS_MESSAGES.Notification.BatchMarkAsReadSuccess,
        result: true,
      };
    })
    .catch(err => {
      logger(
        LOG_TYPES.Error,
        'NotificationRepository.markAsRead',
        err
      );

      return {
        message: ERROR_MESSAGES.Notification.MarkAsReadFailed,
        result: false,
      };
    });
}
