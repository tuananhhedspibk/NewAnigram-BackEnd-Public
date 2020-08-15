import { SES } from 'aws-sdk';

import {
  CHARACTERS_CHAIN,
  LOG_TYPES,
  NO_REPLY_EMAIL,
  SES_CONFIGURES,
  SYSTEM_ERROR_MESSAGES,
  ERROR_MESSAGES,
} from './constants';

import { ActiveAccountMail } from './types';

const ses = new SES(SES_CONFIGURES);

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

export const systemMessageToBusinessMessage = (srcMess: string): string => {
  switch (srcMess) {
    case SYSTEM_ERROR_MESSAGES.Auth.UserDoesNotExist: {
      return ERROR_MESSAGES.Auth.AccountNotExists;
    }
  }

  return '';
}

export const randomString = (length=16) => {
  let result = '';
  for (let i = 0; i < length; i++ ) {
    result += CHARACTERS_CHAIN.charAt(
      Math.floor(Math.random() * CHARACTERS_CHAIN.length)
    );
  }

  return result;
}

export const sendActiveAccountEmail = async (
  mailData: ActiveAccountMail
): Promise<void> => {
  const params: SES.SendEmailRequest = {
    Destination: { ToAddresses: [ mailData.target ] },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
            <html>
              <body>
                <p>Many thanks for using our application.</p>
                <p>Click or tap on the below link to active your account before experencing with us:</p>
                <a href="https://www.newanigram.net/activeaccount?uid=${mailData.uid}&key=${mailData.key}">https://newanigram.net/activeaccount?uid=${mailData.uid}&key=${mailData.key}</a>
              </body>
            </html>
          `
        },
        Text: {
          Charset: 'UTF-8',
          Data: `Click or tap on this link to active your account before experencing with us: https://www.newanigram.net/activeaccount?uid=${mailData.uid}&key=${mailData.key}`
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Active account email',
      }
    },
    Source: NO_REPLY_EMAIL,
  };

  await ses.sendEmail(params).promise()
    .catch(err => {
      logger(LOG_TYPES.Error, 'Helpers.sendValidateSignUpEmail', err);
    });
}
