import * as mutations from '../libs/mutations';
import {
  ActiveAccountKeyRepository,
  FollowRepository,
  UserRepository,
} from '../libs/repositories';

import { testClient } from '../utils/mocking';
import { connectToDB, closeDBConnection } from '../utils/dbDriver';
import { randomEmail, randomId, setAuthToken } from '../utils/helpers';
import { DEFAULT_PASSWORD } from '../utils/constants';

import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../src/utils/constants';

const { mutate } = testClient;

let activeAccKeyRepo: any = null;
let followRepo: any = null;
let userRepo: any = null;

beforeAll(async () => {
  await connectToDB();

  activeAccKeyRepo = new ActiveAccountKeyRepository();
  followRepo = new FollowRepository();
  userRepo = new UserRepository();
});

afterAll(async () => {
  await closeDBConnection();
});

describe('Unauthen test cases', () => {
  let testUser: any = null;
  
  beforeAll(async () => {
    testUser = await userRepo.create(randomEmail());
  });

  it('FollowUser case', async () => {
    const response = await mutate({
      mutation: mutations.followUser,
      variables: {
        followingUserId: testUser._id.toString()
      },
    });

    expect(response.data.followUser.result).toEqual(false);
    expect(response.data.followUser.message).toEqual(
      ERROR_MESSAGES.Auth.Unauthen
    );
  });

  it('UnfollowUser case', async () => {
    const response = await mutate({
      mutation: mutations.unfollowUser,
      variables: {
        unfollowUserId: testUser._id.toString(),
      },
    });

    expect(response.data.unfollowUser.result).toEqual(false);
    expect(response.data.unfollowUser.message).toEqual(
      ERROR_MESSAGES.Auth.Unauthen
    );
  });

  it('UpdateUser case', async () => {
    const updateData = {
      id: testUser._id.toString(),
      email: 'updated@mail.com',
      avatarURL: 'avatarURL',
      userName: 'userName',
      nickName: 'nickName',
    };
    const response = await mutate({
      mutation: mutations.updateUser,
      variables: updateData,
    });

    expect(response.data.updateUser.result).toEqual(false);
    expect(response.data.updateUser.message).toEqual(
      ERROR_MESSAGES.Auth.Unauthen
    );
  });
});

describe('ActiveAccount mutation test cases', () => {
  it('Success case', async () => {
    const testUserEmail = randomEmail();
    const testUserAuthenData = {
      email: testUserEmail,
      password: DEFAULT_PASSWORD,
    };

    await mutate({
      mutation: mutations.signUp,
      variables: testUserAuthenData,
    });

    const testUsersData = await userRepo.getByAttributes([{
      key: 'email',
      value: testUserEmail,
    }]);

    const activeAccKeyData = await activeAccKeyRepo.getByAttributes([{
      key: 'user',
      value: testUsersData[0],
    }]);
    const activeKey = activeAccKeyData[0].rawValue;

    const response = await mutate({
      mutation: mutations.activeAccount,
      variables: {
        uid: testUsersData[0]._id.toString(),
        key: activeKey,
      },
    });

    expect(response.data.activeAccount.result).toEqual(true);
    expect(response.data.activeAccount.message).toEqual(
      SUCCESS_MESSAGES.ActiveAccount.ActiveSuccess
    );
    expect(response.data.activeAccount.user).not.toBe(null);
    expect(response.data.activeAccount.token.length).toBeGreaterThan(0);
  });

  it('Failed case (Not registered)', async () => {
    const userId = randomId();
  
    const response = await mutate({
      mutation: mutations.activeAccount,
      variables: {
        uid: userId,
        key: 'activeKey',
      },
    });

    expect(response.data.activeAccount.result).toEqual(false);
    expect(response.data.activeAccount.message).toEqual(
      ERROR_MESSAGES.ActiveAccount.NotRegisteredOrActivated
    );
  });

  it('Failed case (Actived)', async () => {
    const testUserEmail = randomEmail();
    const testUserAuthenData = {
      email: testUserEmail,
      password: DEFAULT_PASSWORD,
    };

    await mutate({
      mutation: mutations.signUp,
      variables: testUserAuthenData,
    });

    const testUsersData = await userRepo.getByAttributes([{
      key: 'email',
      value: testUserEmail,
    }]);

    const activeAccKeyData = await activeAccKeyRepo.getByAttributes([{
      key: 'user',
      value: testUsersData[0],
    }]);
    const activeKey = activeAccKeyData[0].rawValue;

    await mutate({
      mutation: mutations.activeAccount,
      variables: {
        uid: testUsersData[0]._id.toString(),
        key: activeKey,
      },
    });

    const response = await mutate({
      mutation: mutations.activeAccount,
      variables: {
        uid: testUsersData[0]._id.toString(),
        key: activeKey,
      },
    });

    expect(response.data.activeAccount.result).toEqual(false);
    expect(response.data.activeAccount.message).toEqual(
      ERROR_MESSAGES.ActiveAccount.NotRegisteredOrActivated,
    );
  });
});

describe('User mutations success test cases', () => {
  let defaultUser: any = null;
  let testUser: any = null;

  beforeAll(async () => {
    defaultUser = await userRepo.create(randomEmail());

    const response = await mutate({
      mutation: mutations.signIn,
      variables: {
        email: defaultUser.email,
        password: defaultUser.password
      }
    });

    if (response.data.signIn.result) {
      setAuthToken(response.data.signIn.token);
    }
  });
  afterAll(() => {
    setAuthToken('');
  });

  beforeEach(async () => {
    testUser = await userRepo.create(randomEmail());
  });

  it('FollowUser case', async () => {
    const response = await mutate({
      mutation: mutations.followUser,
      variables: {
        followingUserId: testUser._id.toString(),
      },
    });

    expect(response.data.followUser.result).toEqual(true);
    expect(response.data.followUser.message).toEqual(
      SUCCESS_MESSAGES.Follow.FollowUserSuccess
    );

    const defaultUserData = await userRepo.getById(defaultUser._id.toString());
    const testUserData = await userRepo.getById(testUser._id.toString());

    expect(defaultUserData.followings.indexOf(testUser._id.toString())).toBeGreaterThan(-1);
    expect(testUserData.followers.indexOf(defaultUser._id.toString())).toBeGreaterThan(-1);
  });

  it('UnfollowUser case', async () => {
    await followRepo.create(
      defaultUser,
      testUser,
    );

    const response = await mutate({
      mutation: mutations.unfollowUser,
      variables: {
        unfollowUserId: testUser._id.toString()
      },
    });

    expect(response.data.unfollowUser.result).toEqual(true);
    expect(response.data.unfollowUser.message).toEqual(
      SUCCESS_MESSAGES.Unfollow.UnfollowUserSuccess
    );

    const defaultUserData = await userRepo.getById(defaultUser._id.toString());
    const testUserData = await userRepo.getById(testUser._id.toString());

    expect(
      defaultUserData.followings.indexOf(testUser._id.toString())
    ).toEqual(-1);
    expect(
      testUserData.followers.indexOf(defaultUser._id.toString())
    ).toEqual(-1);
  });

  it('UpdateUser case', async () => {
    const updateData = {
      id: defaultUser._id.toString(),
      email: 'updated@mail.com',
      avatarURL: 'avatarURL',
      userName: 'userName',
      nickName: 'nickName',
    };
    const response = await mutate({
      mutation: mutations.updateUser,
      variables: updateData,
    });

    expect(response.data.updateUser.result).toEqual(true);
    expect(response.data.updateUser.message).toEqual(
      SUCCESS_MESSAGES.User.UpdateUserSuccess
    );

    const defaultUserData = await userRepo.getById(defaultUser._id.toString());

    expect(defaultUserData.email).toEqual(updateData.email);
    expect(defaultUserData.avatarURL).toEqual(updateData.avatarURL);
    expect(defaultUserData.userName).toEqual(updateData.userName);
    expect(defaultUserData.nickName).toEqual(updateData.nickName);
  });
});

describe('User mutations failed test cases', () => {
  let defaultUser: any = null;
  let testUser: any = null;
  
  beforeAll(async () => {
    testUser = await userRepo.create(randomEmail());
    defaultUser = await userRepo.create(randomEmail());

    const response = await mutate({
      mutation: mutations.signIn,
      variables: {
        email: defaultUser.email,
        password: defaultUser.password
      }
    });

    if (response.data.signIn.result) {
      setAuthToken(response.data.signIn.token);
    }
  });

  afterAll(() => {
    setAuthToken('');
  });

  it('UnfollowUser case (have not followed)', async () => {
    const response = await mutate({
      mutation: mutations.unfollowUser,
      variables: {
        unfollowUserId: testUser._id.toString() 
      }
    });

    expect(response.data.unfollowUser.result).toEqual(false);
    expect(response.data.unfollowUser.message).toEqual(
      ERROR_MESSAGES.Unfollow.HaveNotFollowed
    );
  });

  it('FollowUser case (already followed)', async () => {
    await followRepo.create(
      defaultUser,
      testUser
    );

    const response = await mutate({
      mutation: mutations.followUser,
      variables: {
        followingUserId: testUser._id.toString() 
      }
    });

    expect(response.data.followUser.result).toEqual(false);
    expect(response.data.followUser.message).toEqual(
      ERROR_MESSAGES.Follow.AlreadyFollow
    );
  });

  it('UpdateUser case (unauthor)', async () => {
    const updateData = {
      id: testUser._id.toString(),
      email: 'updated@mail.com',
      avatarURL: 'avatarURL',
      userName: 'userName',
      nickName: 'nickName',
    };
    const response = await mutate({
      mutation: mutations.updateUser,
      variables: updateData,
    });

    expect(response.data.updateUser.result).toEqual(false);
    expect(response.data.updateUser.message).toEqual(
      ERROR_MESSAGES.Auth.Unauthorized,
    );
  });
});
