import { ObjectId } from 'mongodb';

import * as mutations from '../libs/mutations';
import {
  NotificationRepository,
  UserRepository,
} from '../libs/repositories';

import { testClient } from '../utils/mocking';
import { connectToDB, closeDBConnection } from '../utils/dbDriver';
import { BATCH_SIZE_TEST } from '../utils/constants';
import { randomEmail, setAuthToken } from '../utils/helpers';

import {
  ERROR_MESSAGES,
  NotificationTypes,
  SUCCESS_MESSAGES,
} from '../../src/utils/constants';

const { mutate } = testClient;

let userRepo: any = null;
let notifyRepo: any = null;

beforeAll(async () => {
  await connectToDB();

  notifyRepo = new NotificationRepository();
  userRepo = new UserRepository();
});

afterAll(async () => {
  await closeDBConnection();
});


describe('Unauthen test cases', () => {
  let defaultUser: any = null;
  
  beforeAll(async () => {
    defaultUser = await userRepo.create(randomEmail());
  });
  
  it('MarkNotificationAsRead case', async () => {
    const notify = await notifyRepo.create(
      defaultUser,
      'notify content',
      NotificationTypes.Follow
    );

    const response = await mutate({
      mutation: mutations.markNotificationAsRead,
      variables: {
        id: notify._id.toString(),
      }
    });

    expect(response.data.markNotificationAsRead.result).toEqual(false);
    expect(response.data.markNotificationAsRead.message).toEqual(
      ERROR_MESSAGES.Auth.Unauthen
    );
  });

  it('MarkNotificationAsReadByBatch case', async () => {
    const notifyCreateTasks = [];
    let notifyIds: any = [];
    
    for (let i = 0; i < BATCH_SIZE_TEST; i++) {
      notifyCreateTasks.push(notifyRepo.create(
        defaultUser,
        'notify content',
        NotificationTypes.Follow,
      ));
    }

    await Promise.all(notifyCreateTasks)
      .then(notifies => {
        notifyIds = notifies.map(notify => notify._id.toString());
      });

    const response = await mutate({
      mutation: mutations.markNotificationAsReadByBatch,
      variables: {
        ids: notifyIds,
      },
    });

    expect(response.data.markNotificationAsReadByBatch.result).toEqual(false);
    expect(response.data.markNotificationAsReadByBatch.message).toEqual(
      ERROR_MESSAGES.Auth.Unauthen
    );
  });
});

describe('Notification mutations success cases', () => {
  let defaultUser: any = null;

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

  it('MarkNotificationAsRead case', async () => {
    const notify = await notifyRepo.create(
      defaultUser,
      'notify content',
      NotificationTypes.Follow
    );

    const response = await mutate({
      mutation: mutations.markNotificationAsRead,
      variables: {
        id: notify._id.toString(),
      }
    });

    expect(response.data.markNotificationAsRead.result).toEqual(true);
    expect(response.data.markNotificationAsRead.message).toEqual(
      SUCCESS_MESSAGES.Notification.MarkAsReadSuccess
    );

    const notifyData = await notifyRepo.getById(notify._id.toString());

    expect(notifyData.read).toEqual(true);
  });

  it('MarkNotificationAsReadByBatch case', async () => {
    const notifyCreateTasks = [];
    let notifyIds: any = [];
    
    for (let i = 0; i < BATCH_SIZE_TEST; i++) {
      notifyCreateTasks.push(notifyRepo.create(
        defaultUser,
        'notify content',
        NotificationTypes.Follow,
      ));
    }

    await Promise.all(notifyCreateTasks)
      .then(notifies => {
        notifyIds = notifies.map(notify => notify._id.toString());
      });

    const response = await mutate({
      mutation: mutations.markNotificationAsReadByBatch,
      variables: {
        ids: notifyIds,
      },
    });

    expect(response.data.markNotificationAsReadByBatch.result).toEqual(true);
    expect(response.data.markNotificationAsReadByBatch.message).toEqual(
      SUCCESS_MESSAGES.Notification.BatchMarkAsReadSuccess
    );

    const getNotifyDataTasks = notifyIds.map(
      (id: string) => notifyRepo.getById(id)
    );

    await Promise.all(getNotifyDataTasks)
      .then(notifiesData => {
        notifiesData.forEach((notifyData: any) => {
          expect(notifyData.read).toEqual(true);
        });
      });
  });
});

describe('Notification mutations failed cases', () => {
  let defaultUser: any = null;
  let testUser: any = null;

  beforeAll(async () => {
    testUser = await userRepo.create(randomEmail());
    defaultUser = await userRepo.create(randomEmail());

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

  it('MarkNotificationAsRead case', async () => {
    const notify = await notifyRepo.create(
      testUser,
      'notify content',
      NotificationTypes.Follow
    );

    const response = await mutate({
      mutation: mutations.markNotificationAsRead,
      variables: {
        id: notify._id.toString(),
      }
    });

    expect(response.data.markNotificationAsRead.result).toEqual(false);
    expect(response.data.markNotificationAsRead.message).toEqual(
      ERROR_MESSAGES.Auth.Unauthorized
    );

    const notifyData = await notifyRepo.getById(notify._id.toString());

    expect(notifyData.read).toEqual(false);
  });

  it('MarkNotificationAsReadByBatch case', async () => {
    const notifyCreateTasks = [];
    let notifyIds: any = [];
    
    for (let i = 0; i < BATCH_SIZE_TEST - 1; i++) {
      notifyCreateTasks.push(notifyRepo.create(
        defaultUser,
        'notify content',
        NotificationTypes.Follow,
      ));
    }

    notifyCreateTasks.push(notifyRepo.create(
      testUser,
      'notify content',
      NotificationTypes.Follow,
    ));

    await Promise.all(notifyCreateTasks)
      .then(notifies => {
        notifyIds = notifies.map(notify => notify._id.toString());
      });

    const response = await mutate({
      mutation: mutations.markNotificationAsReadByBatch,
      variables: {
        ids: notifyIds,
      },
    });

    expect(response.data.markNotificationAsReadByBatch.result).toEqual(false);
    expect(response.data.markNotificationAsReadByBatch.message).toEqual(
      ERROR_MESSAGES.Auth.Unauthorized
    );
  
    const getNotifyDataTasks = notifyIds.map(
      (id: string) => notifyRepo.getById(id)
    );

    await Promise.all(getNotifyDataTasks)
      .then(notifiesData => {
        notifiesData.forEach((notifyData: any) => {
          expect(notifyData.read).toEqual(false);
        });
      });
  });
});
