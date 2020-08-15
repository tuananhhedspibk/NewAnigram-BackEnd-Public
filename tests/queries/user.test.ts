import { ObjectId } from 'mongodb';

import * as queries from '../libs/queries';
import * as mutations from '../libs/mutations';
import {
  FollowRepository,
  SuggestFriendRepository,
  UserRepository,
} from '../libs/repositories';

import { testClient } from '../utils/mocking';
import { connectToDB, closeDBConnection } from '../utils/dbDriver';
import { randomEmail, randomId, setAuthToken } from '../utils/helpers';
import {
  AUTHEN_ERROR_MESSAGE,
  DEFAULT_PASSWORD,
  SUGGEST_FRIENDS_LIMIT_TEST
} from '../utils/constants';

import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  MAX_SUGGEST_USERS_COUNT,
} from '../../src/utils/constants';

const { query, mutate } = testClient;

let followRepo: any = null;
let suggestFriendRepo: any = null;
let userRepo: any = null;

beforeAll(async () => {
  await connectToDB();

  followRepo = new FollowRepository();
  suggestFriendRepo = new SuggestFriendRepository();
  userRepo = new UserRepository();
});

afterAll(async () => {
  await closeDBConnection();
});

describe('Unauthen test cases', () => {
  let defaultUser: any = null;
  let testUser: any = null;

  beforeAll(async () => {
    defaultUser = await userRepo.create(randomEmail());
    testUser = await userRepo.create(randomEmail());
  });

  it('ConfirmPassword case', async () => {
    const response = await query({
      query: queries.confirmPassword,
      variables: {
        candidatePassword: DEFAULT_PASSWORD
      },
    });

    expect(response.data.confirmPassword.result).toEqual(false);
    expect(response.data.confirmPassword.message).toEqual(
      ERROR_MESSAGES.Auth.Unauthen
    );
  });

  it('FetchSuggestFriends case', async () => {
    await suggestFriendRepo.create(
      defaultUser._id.toString(), [
        new ObjectId(randomId()),
        new ObjectId(randomId()),
        new ObjectId(randomId()),
      ],
    );
  
    const response = await query({
      query: queries.fetchSuggestFriends,
      variables: {
        limit: SUGGEST_FRIENDS_LIMIT_TEST,
      },
    });

    expect(response.data.suggestFriends.result).toEqual(false);
    expect(response.data.suggestFriends.message).toEqual(
      ERROR_MESSAGES.Auth.Unauthen
    );
  });

  it('FetchUser case', async () => {
    const response = await query({
      query: queries.fetchUser,
      variables: {
        id: defaultUser._id.toString(),
      }
    });

    expect(response.errors[0].message).toEqual(AUTHEN_ERROR_MESSAGE);
  });

  it('IsFollowingUser case', async () => {
    await followRepo.create(
      defaultUser,
      testUser,
    );

    const response = await query({
      query: queries.isFollowingUser,
      variables: {
        userId: testUser._id.toString()
      }
    });

    expect(response.data.isFollowingUser.result).toEqual(false);
    expect(response.data.isFollowingUser.message).toEqual(
      ERROR_MESSAGES.Auth.Unauthen
    );
  });
});

describe('User queries test cases', () => {
  let defaultUser: any = null;
  let testUser: any = null;

  let sgUser1: any = null;
  let sgUser2: any = null;
  let sgUser3: any = null;

  beforeAll(async () => {
    defaultUser = await userRepo.create(randomEmail());
    testUser = await userRepo.create(randomEmail());

    sgUser1 = await userRepo.create(randomEmail());
    sgUser2 = await userRepo.create(randomEmail());
    sgUser3 = await userRepo.create(randomEmail());

    const response = await mutate({
      mutation: mutations.signIn,
      variables: {
        email: defaultUser.email,
        password: defaultUser.password,
      }
    });

    if (response.data.signIn.result) {
      setAuthToken(response.data.signIn.token);
    }
  });

  afterAll(() => {
    setAuthToken('');
  });
  
  it('ConfirmPassword case', async () => {
    const response = await query({
      query: queries.confirmPassword,
      variables: {
        candidatePassword: DEFAULT_PASSWORD
      },
    });

    expect(response.data.confirmPassword.result).toEqual(true);
    expect(response.data.confirmPassword.message).toEqual(
      SUCCESS_MESSAGES.Auth.ComparePassword
    );
  });

  it('FetchUser case', async () => {
    let response: any = null;
    
    response = await query({
      query: queries.fetchUser,
      variables: {
        id: defaultUser._id.toString(),
      }
    });

    expect(response.data.user).not.toBe(null);

    response = await query({
      query: queries.fetchUser,
      variables: {
        id: testUser._id.toString(),
      }
    });

    expect(response.data.user).not.toBe(null);
  });

  it('FetchSuggestFriends case', async () => {
    await suggestFriendRepo.create(
      defaultUser._id.toString(), [
        sgUser1._id,
        sgUser2._id,
        sgUser3._id,
      ],
    );
  
    const response = await query({
      query: queries.fetchSuggestFriends,
      variables: {
        limit: SUGGEST_FRIENDS_LIMIT_TEST,
      },
    });

    expect(response.data.suggestFriends.result).toEqual(true);
    expect(response.data.suggestFriends.users.length).toEqual(3);
    expect(response.data.suggestFriends.message).toEqual(
      SUCCESS_MESSAGES.SuggestUsers.FetchSuccess
    );
  });

  it('IsFollowingUser case', async () => {
    await followRepo.create(
      defaultUser,
      testUser,
    );

    const response = await query({
      query: queries.isFollowingUser,
      variables: {
        userId: testUser._id.toString()
      }
    });

    expect(response.data.isFollowingUser.result).toEqual(true);
    expect(response.data.isFollowingUser.message).toEqual(
      SUCCESS_MESSAGES.Follow.AlreadyFollow
    );
  });
});

describe('User mutations failed test case', () => {
  let defaultUser: any = null;
  let testUser: any = null;

  let sgUser1: any = null;
  let sgUser2: any = null;
  let sgUser3: any = null;

  beforeAll(async () => {
    defaultUser = await userRepo.create(randomEmail());
    testUser = await userRepo.create(randomEmail());

    sgUser1 = await userRepo.create(randomEmail());
    sgUser2 = await userRepo.create(randomEmail());
    sgUser3 = await userRepo.create(randomEmail());

    const response = await mutate({
      mutation: mutations.signIn,
      variables: {
        email: defaultUser.email,
        password: defaultUser.password,
      }
    });

    if (response.data.signIn.result) {
      setAuthToken(response.data.signIn.token);
    }
  });

  afterAll(() => {
    setAuthToken('');
  });

  it('ConfirmPassword case', async () => {
    const response = await query({
      query: queries.confirmPassword,
      variables: {
        candidatePassword: ''
      }
    });

    expect(response.data.confirmPassword.result).toEqual(false);
    expect(response.data.confirmPassword.message).toEqual(
      ERROR_MESSAGES.Auth.ComparePassword
    );
  });

  it('FetchSuggestFriends case', async () => {
    await suggestFriendRepo.create(
      defaultUser._id.toString(), [
        sgUser1._id,
        sgUser2._id,
        sgUser3._id,
      ],
    );
  
    const response = await query({
      query: queries.fetchSuggestFriends,
      variables: {
        limit: MAX_SUGGEST_USERS_COUNT + 1
      },
    });

    expect(response.data.suggestFriends.result).toEqual(false);
    expect(response.data.suggestFriends.message).toEqual(
      ERROR_MESSAGES.SuggestUsers.LimitParamGreaterThanMaxCount
    );
  });

  it('IsFollowingUser case', async () => {
    const response = await query({
      query: queries.isFollowingUser,
      variables: {
        userId: testUser._id.toString()
      }
    });

    expect(response.data.isFollowingUser.result).toEqual(false);
    expect(response.data.isFollowingUser.message).toEqual(
      SUCCESS_MESSAGES.Unfollow.HaveNotFollowed
    );
  });
});
