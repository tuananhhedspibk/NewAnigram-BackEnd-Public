import { model } from 'mongoose';
import * as jwt from 'jsonwebtoken';

import { JWTConfig } from './config';

import {
  ActiveAccountKeyInterface,
  UserInterface,
} from '../../models/interfaces';
import { UserSchema } from '../../models/user';
import { ActiveAccountKeySchema } from '../../models/activeAccountKey';

import * as DailySendMailLogRepository from '../dailySendMailLog';
import * as ActiveAccountKeyRepo from '../activeAccountKey';
import * as SuggestFriendRepository from '../suggestFriend';

import {
  ERROR_MESSAGES,
  LOG_TYPES,
  SUCCESS_MESSAGES,
  TRIGGER_EVENTS,
} from '../../utils/constants';
import {
  AuthenResult,
  APIResult,
  ActiveAccountMail,
} from '../../utils/types';
import {
  logger,
  sendActiveAccountEmail,
  systemMessageToBusinessMessage,
} from '../../utils/helpers';

const User = model<UserInterface>('user', UserSchema);
const ActiveAccountKey =
  model<ActiveAccountKeyInterface>(
    'activeAccountKey',
    ActiveAccountKeySchema
  );

export const signUp = async (
  email: string,
  password: string,
): Promise<AuthenResult | void> => {
  if (!email || !password) {
    return {
      user: null as any,
      token: '',
      message: ERROR_MESSAGES.Auth.MustProvideEmailAndPass,
      result: false,
    };
  }

  return User.findOne({ email })
    .then(async existingUser => {
      if (existingUser) {
        return {
          user: null,
          token: '',
          message: ERROR_MESSAGES.Auth.MailInUse,
          result: false,
        } as any;
      }

      const currentTimeStamp = new Date();
      const user = new User({
        email,
        password,
        userName: email,
        nickName: email,
        createdAt: currentTimeStamp,
        updatedAt: currentTimeStamp,
      });
      return user.save()
        .then(async user => {
          const key = await ActiveAccountKeyRepo.create(user) as string;
          const activeMailData: ActiveAccountMail = {
            target: email,
            uid: user.id,
            key,
          };
          const tasks = [
            SuggestFriendRepository.create(user.id),
            DailySendMailLogRepository.create(email),
            sendActiveAccountEmail(activeMailData)
          ];

          return Promise.all(tasks)
            .then(_res => ({
                user: null,
                token: '',
                message: SUCCESS_MESSAGES.Auth.SignUpSuccess,
                result: true,
              })
            );
        });
    })
    .catch(err => {
      logger(LOG_TYPES.Error, 'AuthenticationRepository.signUp', err);

      return {
        user: null,
        token: '',
        message: ERROR_MESSAGES.Commons.SystemError,
        result: false,
      };
    });
}

export const signIn = async (
  email: string,
  password: string,
  triggerEvent=TRIGGER_EVENTS.SignIn,
): Promise<AuthenResult> => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if(user && user.comparePassword(password) && user.active) {
      return {
        user: user,
        token: jwt.sign({
          id: user._id
        }, JWTConfig.secret),
        message: triggerEvent === TRIGGER_EVENTS.SignIn
          ? SUCCESS_MESSAGES.Auth.SignInSuccess
          : SUCCESS_MESSAGES.Auth.SignUpSuccess,
        result: true,
      };
    } else {
      return {
        user: null as any,
        token: '',
        message: ERROR_MESSAGES.Auth.EmailPassNotMatch,
        result: false,
      };
    }
  } catch (err) {
    logger(LOG_TYPES.Error, 'AuthenticationRepository.signIn', err);

    return {
      user: null as any,
      token: '',
      message: systemMessageToBusinessMessage(err.toString()),
      result: false,
    }
  }
}

export const authenticate = async (
  authorization: string,
): Promise<UserInterface> => {
  const decodedToken =
    jwt.verify(authorization.split('"')[1], JWTConfig.secret) as any;

  const userId = decodedToken.id;
  const user = await User.findById(userId) as UserInterface;
  
  return user;
}

export const confirmPassword = async (
  contextUser: UserInterface,
  candidatePass: string,
): Promise<APIResult> => {
  if(contextUser.comparePassword(candidatePass)) {
    return {
      result: true,
      message: SUCCESS_MESSAGES.Auth.ComparePassword,
    };
  } else {
    return {
      result: false,
      message: ERROR_MESSAGES.Auth.ComparePassword,
    };
  }
}

export const activeAccount = async (
  uid: string, key: string
): Promise<AuthenResult> => {
  return ActiveAccountKey.find({ user: uid })
    .then(async (results: any) => {
      if (results.length !== 1) {
        return {
          user: null,
          token: '',
          message: ERROR_MESSAGES.ActiveAccount.NotRegisteredOrActivated,
          result: false,
        } as any;
      }

      const keyInstance = results[0];
      const currentTime = new Date();
      const user = await User.findById(uid) as any;

      if (key === keyInstance.rawValue
        && currentTime < keyInstance.expiredAt
        && !user['active']
      ) {
        user['active'] = true;

        await user.save();
        await ActiveAccountKey.deleteOne({ _id: keyInstance._id });

        return {
          user: user,
          token: jwt.sign({
            id: user._id
          }, JWTConfig.secret),
          message: SUCCESS_MESSAGES.ActiveAccount.ActiveSuccess,
          result: true,
        };
      }

      return {
        user: null,
        token: '',
        message: ERROR_MESSAGES.ActiveAccount.ActiveFailed,
        result: false,
      };
    })
    .catch((err: any) => {
      logger(
        LOG_TYPES.Error,
        'AuthenticationRepository.activeAccount',
        err
      );

      return {
        user: null,
        token: '',
        message: ERROR_MESSAGES.Commons.SystemError,
        result: false,
      };
    });
}

export const sendActiveAccountEmailResolver = async (email: string): Promise<APIResult> => {
  try {
    const canSendEmailInDay =
      await DailySendMailLogRepository.canSendEmailInDay(email);

    if (canSendEmailInDay) {
      const users = await User.find({ email });
      const activeAccountKeys =
        await ActiveAccountKey.find({ user: users[0].id });

      if (activeAccountKeys.length === 1) {
        const tasks = [
          DailySendMailLogRepository.create(email)
        ];

        const emailData: ActiveAccountMail = {
          target: email,
          uid: activeAccountKeys[0].user,
          key: activeAccountKeys[0].rawValue,
        }

        tasks.push(sendActiveAccountEmail(emailData));

        return Promise.all(tasks)
          .then(_res => ({
            message: SUCCESS_MESSAGES.SendActiveEmail.Success,
            result: true
          }));
      } else {
        return {
          message:
            ERROR_MESSAGES.SendActiveEmail.EmailUnregisteredOrEmailActivated,
          result: false,
        }
      }
    } else {
      return {
        message: ERROR_MESSAGES.SendActiveEmail.MaximumMailInDayExceed,
        result: false,
      }
    }
  }
  catch (err) {
    logger(
      LOG_TYPES.Error,
      'AuthenticationRepository.sendActiveAccountEmailResolver',
      err
    );

    return {
      message: ERROR_MESSAGES.Commons.SystemError,
      result: false,
    };
  }
}
