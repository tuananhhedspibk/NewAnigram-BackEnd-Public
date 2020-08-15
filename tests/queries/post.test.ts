import { ObjectId } from 'mongodb';

import * as queries from '../libs/queries';
import * as mutations from '../libs/mutations';
import {
  FollowRepository,
  PostRepository,
  UserRepository,
} from '../libs/repositories';

import { testClient } from '../utils/mocking';
import { connectToDB, closeDBConnection } from '../utils/dbDriver';
import { randomEmail, randomId, setAuthToken } from '../utils/helpers';
import {
  AUTHEN_ERROR_MESSAGE,
  POSTS_LIMIT_TEST,
} from '../utils/constants';

const { query, mutate } = testClient;

let followRepo: any = null;
let postRepo: any = null;
let userRepo: any = null;

beforeAll(async () => {
  await connectToDB();

  followRepo = new FollowRepository();
  postRepo = new PostRepository();
  userRepo = new UserRepository();
});

afterAll(async () => {
  await closeDBConnection();
});

describe('Unauthen test cases', () => {
  let defaultUser: any = null;
  let postId: string;

  beforeAll(async () => {
    defaultUser = await userRepo.create(randomEmail());
  });
  
  it('FetchPost case', async () => {
    postId = randomId();

    const postData = {
      id: new ObjectId(postId),
      content: 'Post content',
      images: [
        { source: 'image1' },
        { source: 'image2' }
      ],
      tags: ['tag1', 'tag2'],
    }
    await postRepo.create(
      postData,
      defaultUser,
    );

    const response = await query({
      query: queries.fetchPost,
      variables: {
        id: postId
      }
    });

    expect(response.errors[0].message).toEqual(AUTHEN_ERROR_MESSAGE);
  });

  it('FetchPosts case', async () => {
    for (let i = 0; i < POSTS_LIMIT_TEST; i++) {
      await postRepo.create({
        id: new ObjectId(randomId()),
        content: `Post content ${i}`,
        images: [
          { source: 'image1' },
          { source: 'image2' }
        ],
        tags: ['tag1', 'tag2'],
      }, defaultUser);
    }

    const response = await query({
      query: queries.fetchPosts,
      variables: {
        orderBy: {
          field: 'createdAt',
          direction: 'desc',
        }
      }
    });

    expect(response.errors[0].message).toEqual(AUTHEN_ERROR_MESSAGE);
  });
});

describe('Post queries test cases', () => {
  let defaultUser: any = null;
  let postId: string;

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

  it('FetchPosts case', async () => {
    const testUser = await userRepo.create(randomEmail());

    await followRepo.create(
      defaultUser,
      testUser
    );

    for (let i = 0; i < POSTS_LIMIT_TEST; i++) {
      await postRepo.create({
        id: new ObjectId(randomId()),
        content: `Post content ${i}`,
        images: [
          { source: 'image1' },
          { source: 'image2' }
        ],
        tags: ['tag1', 'tag2'],
      }, defaultUser);

      await postRepo.create({
        id: new ObjectId(randomId()),
        content: `Post content ${i}`,
        images: [
          { source: 'image1' },
          { source: 'image2' }
        ],
        tags: ['tag1', 'tag2'],
      }, testUser);
    }

    const response = await query({
      query: queries.fetchPosts,
      variables: {
        orderBy: {
          field: 'createdAt',
          direction: 'desc',
        }
      }
    });

    expect(response.data.fetchPosts.posts.length).toEqual(POSTS_LIMIT_TEST * 2);
  });

  it('FetchPost case', async () => {
    postId = randomId();

    const postData = {
      id: new ObjectId(postId),
      content: 'Post content',
      images: [
        { source: 'image1' },
        { source: 'image2' }
      ],
      tags: ['tag1', 'tag2'],
    }
    await postRepo.create(
      postData,
      defaultUser,
    );

    const response = await query({
      query: queries.fetchPost,
      variables: {
        id: postId
      }
    });

    expect(response.data.post).not.toBe(null);
  });
});
