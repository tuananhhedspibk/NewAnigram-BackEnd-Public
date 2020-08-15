import * as mutations from '../libs/mutations';
import {
  DailySendMailLogRepository,
  SuggestFriendRepository,
  UserRepository,
} from '../libs/repositories';

import { testClient } from '../utils/mocking';
import { randomEmail } from '../utils/helpers';
import { DEFAULT_PASSWORD } from '../utils/constants';
import { connectToDB, closeDBConnection } from '../utils/dbDriver';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../src/utils/constants';

const { mutate } = testClient;

beforeAll(async () => {
  await connectToDB();
});

afterAll(async () => {
  await closeDBConnection();
});

describe('Authentication success test cases', () => {
  const userRepo = new UserRepository();

  it('Signup mutation case', async () => {
    const testUserEmail = randomEmail();
    const testUser = {
      email: testUserEmail,
      password: DEFAULT_PASSWORD,
    };

    const response = await mutate({
      mutation: mutations.signUp,
      variables: testUser,
    });

    expect(response.data.signUp.result).toEqual(true);
    expect(response.data.signUp.message).toEqual(
      SUCCESS_MESSAGES.Auth.SignUpSuccess
    );

    const suggestFriendRepo = new SuggestFriendRepository();
    const dailySendMailLogRepo = new DailySendMailLogRepository();

    const userRecords = await userRepo.getByAttributes([{
      key: 'email',
      value: testUserEmail,
    }]);
    expect(userRecords.length).toEqual(1);

    const suggestFriendRecords = await suggestFriendRepo.getByAttributes([{
      key: 'owner',
      value: userRecords[0].id
    }]);
    expect(suggestFriendRecords.length).toEqual(1);

    const dailySendMailLogRecords = await dailySendMailLogRepo.getByAttributes([{
      key: 'email',
      value: testUserEmail,
    }]);
    expect(dailySendMailLogRecords.length).toEqual(1);
  });

  it('Signin mutation case', async () => {
    const user = await userRepo.create(randomEmail());

    const response = await mutate({
      mutation: mutations.signIn,
      variables: {
        email: user.email,
        password: user.password,
      },
    });

    expect(response.data.signIn.result).toEqual(true);
    expect(response.data.signIn.message).toEqual(
      SUCCESS_MESSAGES.Auth.SignInSuccess
    );
    expect(response.data.signIn.token.length).toBeGreaterThan(0);
    expect(response.data.signIn.user).not.toEqual(null);
  })
});

describe('Authentication failed test cases', () => {
  const userRepo = new UserRepository();

  it('Signup mutation (email is empty) case', async () => {
    const testUser = {
      email: '',
      password: DEFAULT_PASSWORD,
    };

    const response = await mutate({
      mutation: mutations.signUp,
      variables: testUser,
    });

    expect(response.data.signUp.result).toEqual(false);
    expect(response.data.signUp.message).toEqual(
      ERROR_MESSAGES.Auth.MustProvideEmailAndPass
    );
  });

  it('Signup mutation (password is empty) case', async () => {
    const testUser = {
      email: randomEmail(),
      password: '',
    };

    const response = await mutate({
      mutation: mutations.signUp,
      variables: testUser,
    });

    expect(response.data.signUp.result).toEqual(false);
    expect(response.data.signUp.message).toEqual(
      ERROR_MESSAGES.Auth.MustProvideEmailAndPass
    );
  });

  it('Signup mutation (email already in used) case', async () => {
    const defaultUserEmail = randomEmail();
    const defaultUser = await userRepo.create(defaultUserEmail);
    const testUser = {
      email: defaultUserEmail,
      password: DEFAULT_PASSWORD
    };

    const response = await mutate({
      mutation: mutations.signUp,
      variables: testUser,
    });

    expect(response.data.signUp.result).toEqual(false);
    expect(response.data.signUp.message).toEqual(
      ERROR_MESSAGES.Auth.MailInUse
    );
    expect(response.data.signUp.token.length).toEqual(0);
    expect(response.data.signUp.user).toEqual(null);
  });

  it('Signin mutation (email not match) case', async () => {
    const userEmail = randomEmail();
    const user = await userRepo.create(userEmail);
    const response = await mutate({
      mutation: mutations.signIn,
      variables: {
        email: randomEmail(),
        password: user.password,
      },
    });

    expect(response.data.signIn.result).toEqual(false);
    expect(response.data.signIn.message).toEqual(
      ERROR_MESSAGES.Auth.EmailPassNotMatch
    );
    expect(response.data.signIn.token.length).toEqual(0);
    expect(response.data.signIn.user).toEqual(null);
  });

  it('Signin mutation (password not match) case', async () => {
    const user = await userRepo.create(randomEmail());
    const response = await mutate({
      mutation: mutations.signIn,
      variables: {
        email: user.email,
        password: '',
      },
    });

    expect(response.data.signIn.result).toEqual(false);
    expect(response.data.signIn.message).toEqual(
      ERROR_MESSAGES.Auth.EmailPassNotMatch
    );
    expect(response.data.signIn.token.length).toEqual(0);
    expect(response.data.signIn.user).toEqual(null);
  });
});
