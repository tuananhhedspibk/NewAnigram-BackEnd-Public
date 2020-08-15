import * as mutations from '../libs/mutations';
import { UserRepository } from '../libs/repositories';

import { testClient } from '../utils/mocking';
import { connectToDB, closeDBConnection } from '../utils/dbDriver';
import { randomEmail, setAuthToken } from '../utils/helpers';

const { mutate } = testClient;

let userRepo: any = null;

beforeAll(async () => {
  await connectToDB();

  userRepo = new UserRepository();
});

afterAll(async () => {
  await closeDBConnection();
});

describe('AWS-S3 presigner success test cases', () => {
  beforeAll(async () => {    
    const user = await userRepo.create(randomEmail());

    const response = await mutate({
      mutation: mutations.signIn,
      variables: {
        email: user.email,
        password: user.password,
      },
    });

    if (response.data.signIn.result) {
      setAuthToken(response.data.signIn.token);
    }
  });
  afterAll(() => {
    setAuthToken('');
  });

  it('s3GetURL case', async () => {
    const response = await mutate({
      mutation: mutations.genS3GetURL,
      variables: {
        key: 'key'
      },
    });

    expect(response.data.s3GetURL.result).toEqual(true);
    expect(response.data.s3GetURL.url.length).toBeGreaterThan(0);
  });

  it('s3PutURL case', async () => {
    const response = await mutate({
      mutation: mutations.genS3PutURL,
      variables: {
        key: 'key',
        contentType: 'contentType',
      }
    });

    expect(response.data.s3PutURL.result).toEqual(true);
    expect(response.data.s3PutURL.url.length).toBeGreaterThan(0);
  });
});

describe('AWS-S3 presigner failed test cases', () => {
  it('s3GetURL case', async () => {
    const response = await mutate({
      mutation: mutations.genS3GetURL,
      variables: {
        key: 'key'
      },
    });

    expect(response.data.s3GetURL.result).toEqual(false);
    expect(response.data.s3GetURL.url).toEqual('');
  });

  it('s3PutURL case', async () => {
    const response = await mutate({
      mutation: mutations.genS3PutURL,
      variables: {
        key: 'key',
        contentType: 'contentType',
      }
    });

    expect(response.data.s3PutURL.result).toEqual(false);
    expect(response.data.s3PutURL.url).toEqual('');
  });
});
