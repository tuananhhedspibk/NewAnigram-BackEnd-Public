import { randomString } from '../../src/utils/helpers';

let AUTH_TOKEN = '';

export const randomEmail = (): string => {
  return `${randomString().toLowerCase()}@testmail.com`;
}

export const randomId = (): string => {
  const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
  return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
    return (Math.random() * 16 | 0).toString(16);
  }).toLowerCase();
}

export const setAuthToken = (token: string) => {
  AUTH_TOKEN = token;
}

export const getContext = (): any => {
  return {
    headers: {
      authorization: `"${AUTH_TOKEN}"`
    }
  };
}
