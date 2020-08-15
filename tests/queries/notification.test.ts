import * as queries from '../libs/queries';
import * as mutations from '../libs/mutations';
import {
  NotificationRepository,
  UserRepository,
} from '../libs/repositories';

import { testClient } from '../utils/mocking';
import { connectToDB, closeDBConnection } from '../utils/dbDriver';
import { randomEmail, setAuthToken } from '../utils/helpers';
import {
  AUTHEN_ERROR_MESSAGE,
  NOTIFICATIONS_LIMIT_TEST,
} from '../utils/constants';

import {
  NotificationTypes,
} from '../../src/utils/constants';

const { query, mutate } = testClient;

let notifyRepo: any = null;
let userRepo: any = null;

beforeAll(async () => {
  await connectToDB();

  notifyRepo = new NotificationRepository();
  userRepo = new UserRepository();
});

afterAll(async () => {
  await closeDBConnection();
});

describe('Unauthen test case', () => {
  let defaultUser : any = null;

  beforeAll(async () => {
    defaultUser = await userRepo.create(randomEmail());
  });

  it('FetchNotifications case', async () => {
    const createNotifyTasks = [];
    
    for(let i = 0; i < NOTIFICATIONS_LIMIT_TEST; i++) {
      createNotifyTasks.push(notifyRepo.create(
        defaultUser,
        'notify content',
        NotificationTypes.CommentPost,
      ));
    }

    await Promise.all(createNotifyTasks);

    const response = await query({
      query: queries.fetchNotifications,
    });

    expect(response.errors[0].message).toEqual(AUTHEN_ERROR_MESSAGE);
  });
});

describe('Notification queries success test cases', () => {
  let defaultUser: any = null;

  beforeAll(async () => {
    defaultUser = await userRepo.create(randomEmail());

    const response = await mutate({
      mutation: mutations.signIn,
      variables: {
        email: defaultUser.email,
        password: defaultUser.password,
      },
    });

    if (response.data.signIn.result) {
      setAuthToken(response.data.signIn.token);
    }
  });

  afterAll(() => {
    setAuthToken('');
  });
  
  it('FetchNotifications case', async () => {
    const createNotifyTasks = [];
    
    for(let i = 0; i < NOTIFICATIONS_LIMIT_TEST; i++) {
      createNotifyTasks.push(notifyRepo.create(
        defaultUser,
        'notify content',
        NotificationTypes.CommentPost,
      ));
    }

    await Promise.all(createNotifyTasks);

    const response = await query({
      query: queries.fetchNotifications,
    });

    expect(response.data.notifications.length).toEqual(
      NOTIFICATIONS_LIMIT_TEST
    );
  });
});
