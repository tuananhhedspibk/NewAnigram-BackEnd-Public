import { ObjectId } from 'mongodb';

import * as mutations from '../libs/mutations';
import {
  CommentRepository,
  LikeRepository,
  PostRepository,
  UserRepository,
} from '../libs/repositories';

import { testClient } from '../utils/mocking';
import { connectToDB, closeDBConnection } from '../utils/dbDriver';
import { randomEmail, randomId, setAuthToken } from '../utils/helpers';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../src/utils/constants';

const { mutate } = testClient;

let commentRepo: any = null;
let likeRepo: any = null;
let postRepo: any = null;
let userRepo: any = null;

beforeAll(async () => {
  await connectToDB();

  commentRepo = new CommentRepository();
  likeRepo = new LikeRepository();
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

    postId = randomId();

    const postData = {
      id: new ObjectId(postId),
      content: 'Post content',
      images: [
        { source: 'image1' },
        { source: 'image2' }
      ],
      tags: ['tag1', 'tag2'],
    };
    await postRepo.create(
      postData,
      defaultUser, 
    );
  });

  it('CreatePost case', async () => {
    let postId = randomId();

    const postData = {
      id: postId,
      content: 'Post content',
      images: ['image1', 'image2'],
      tags: ['tag1', 'tag2'],
    };
    const response = await mutate({
      mutation: mutations.createPost,
      variables: postData,
    });

    expect(response.data.createPost.result).toEqual(false);
    expect(response.data.createPost.message).toEqual(
      ERROR_MESSAGES.Auth.Unauthen
    );
  });

  it('LikePost case', async () => {
    const response = await mutate({
      mutation: mutations.likePost,
      variables: {
        postId,
      },
    });

    expect(response.data.likePost.message).toEqual(
      ERROR_MESSAGES.Auth.Unauthen
    );
    expect(response.data.likePost.result).toEqual(false);
  });

  it('UnlikePost case', async () => {
    const response = await mutate({
      mutation: mutations.unlikePost,
      variables: {
        postId,
      },
    });

    expect(response.data.unlikePost.message).toEqual(
      ERROR_MESSAGES.Auth.Unauthen
    );
    expect(response.data.unlikePost.result).toEqual(false);
  });

  it('CommentPost case', async () => {
    const response = await mutate({
      mutation: mutations.commentPost,
      variables: {
        postId,
        commentContent: 'commentContent',
      },
    });

    expect(response.data.commentPost.message).toEqual(
      ERROR_MESSAGES.Auth.Unauthen
    );
    expect(response.data.commentPost.result).toEqual(false);
  });
});

describe('Post mutations success test cases', () => {
  let defaultUser: any = null;
  let testUser: any = null;

  let postId: string;

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

  it('CreatePost case', async () => {
    postId = randomId();

    const postData = {
      id: postId,
      content: 'Post content',
      images: ['image1', 'image2'],
      tags: ['tag1', 'tag2'],
    };
    const response = await mutate({
      mutation: mutations.createPost,
      variables: postData,
    });

    expect(response.data.createPost.result).toEqual(true);
    expect(response.data.createPost.message).toEqual(
      SUCCESS_MESSAGES.Post.CreatePostSuccess
    );

    const defaultUserData = await userRepo.getById(defaultUser.id);

    expect(defaultUserData.posts.length).toEqual(1);
    expect(defaultUserData.posts[0].toString()).toEqual(postId);
  });

  it('LikePost case (my post)', async () => {
    postId = randomId();

    const postData = {
      id: new ObjectId(postId),
      content: 'Post content',
      images: [
        { source: 'image1' },
        { source: 'image2' }
      ],
      tags: ['tag1', 'tag2'],
    };
    const post = await postRepo.create(
      postData,
      defaultUser, 
    );

    const response = await mutate({
      mutation: mutations.likePost,
      variables: {
        postId: post.id,
      },
    });

    expect(response.data.likePost.message).toEqual(
      SUCCESS_MESSAGES.Post.LikePostSuccess
    );
    expect(response.data.likePost.result).toEqual(true);

    const postLikes = await likeRepo.getByAttributes([{
      key: 'user',
      value: defaultUser.id
    }, {
      key: 'post',
      value: postId,
    }]);

    expect(postLikes.length).toEqual(1);
  });

  it('LikePost case (another user post)', async () => {
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
    const post = await postRepo.create(
      postData,
      testUser,  
    );

    const response = await mutate({
      mutation: mutations.likePost,
      variables: {
        postId: post.id,
      },
    });

    expect(response.data.likePost.message).toEqual(
      SUCCESS_MESSAGES.Post.LikePostSuccess
    );
    expect(response.data.likePost.result).toEqual(true);

    const postLikes = await likeRepo.getByAttributes([
      {
        key: 'user',
        value: defaultUser.id
      }, {
        key: 'post',
        value: postId,
      }
    ]);

    expect(postLikes.length).toEqual(1);
  });

  it('CommentPost case (my post)', async () => {
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
    const post = await postRepo.create(
      postData,
      defaultUser, 
    );

    const response = await mutate({
      mutation: mutations.commentPost,
      variables: {
        postId: post.id,
        commentContent: 'comment content'
      },
    });

    expect(response.data.commentPost.result).toEqual(true);
    expect(response.data.commentPost.message).toEqual(
      SUCCESS_MESSAGES.Comment.AddCommentSuccess
    );

    const postComments = await commentRepo.getByAttributes([
      {
        key: 'user',
        value: defaultUser.id
      }, {
        key: 'post',
        value: postId,
      }
    ]);

    expect(postComments.length).toEqual(1);
  });

  it('CommentPost case (another user post)', async () => {
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
      testUser, 
    );

    const response = await mutate({
      mutation: mutations.commentPost,
      variables: {
        postId,
        commentContent: 'comment content'
      },
    });

    expect(response.data.commentPost.result).toEqual(true);
    expect(response.data.commentPost.message).toEqual(
      SUCCESS_MESSAGES.Comment.AddCommentSuccess
    );

    const postComments = await commentRepo.getByAttributes([
      {
        key: 'user',
        value: defaultUser.id
      }, {
        key: 'post',
        value: postId,
      }
    ]);

    expect(postComments.length).toEqual(1);
  });

  it('UnlikePost case (my post)', async () => {
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
    const post = await postRepo.create(
      postData,
      defaultUser,
    );

    await likeRepo.create(post, defaultUser);

    const response = await mutate({
      mutation: mutations.unlikePost,
      variables: {
        postId
      }
    });

    expect(response.data.unlikePost.result).toEqual(true);
    expect(response.data.unlikePost.message).toEqual(
      SUCCESS_MESSAGES.Post.UnlikePostSuccess
    );

    const postLikes = await likeRepo.getByAttributes([
      {
        key: 'post',
        value: postId,
      }
    ]);
    const getPostResult = await postRepo.getById(postId);

    expect(postLikes.length).toEqual(0);
    expect(getPostResult.numberLikes).toEqual(0);
  });

  it('UnlikePost case (another user post)', async () => {
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
    const post = await postRepo.create(
      postData,
      testUser,
    );

    await likeRepo.create(post, defaultUser);

    const response = await mutate({
      mutation: mutations.unlikePost,
      variables: {
        postId
      }
    });

    expect(response.data.unlikePost.result).toEqual(true);
    expect(response.data.unlikePost.message).toEqual(
      SUCCESS_MESSAGES.Post.UnlikePostSuccess
    );

    const postLikes = await likeRepo.getByAttributes([
      {
        key: 'post',
        value: postId,
      }
    ]);
    const getPostResult = await postRepo.getById(postId);

    expect(postLikes.length).toEqual(0);
    expect(getPostResult.numberLikes).toEqual(0);
  });
});

describe('Post mutations failed test cases', () => {
  let defaultUser: any = null;
  let testUser: any = null;

  let postId: string;

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

  it('LikePost case (my post)', async () => {
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
    const post = await postRepo.create(
      postData,
      defaultUser,
    );

    await likeRepo.create(post, defaultUser);

    const response = await mutate({
      mutation: mutations.likePost,
      variables: {
        postId
      }
    });

    expect(response.data.likePost.result).toEqual(false);
    expect(response.data.likePost.message).toEqual(ERROR_MESSAGES.Post.AlreadyLikedPost);
  });

  it('LikePost case (another user post)', async () => {
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
    const post = await postRepo.create(
      postData,
      testUser,
    );

    await likeRepo.create(post, defaultUser);

    const response = await mutate({
      mutation: mutations.likePost,
      variables: {
        postId
      }
    });

    expect(response.data.likePost.result).toEqual(false);
    expect(response.data.likePost.message).toEqual(ERROR_MESSAGES.Post.AlreadyLikedPost);
  });

  it('UnlikePost case (my post)', async () => {
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

    const response = await mutate({
      mutation: mutations.unlikePost,
      variables: {
        postId
      }
    });

    expect(response.data.unlikePost.result).toEqual(false);
    expect(response.data.unlikePost.message).toEqual(
      ERROR_MESSAGES.Post.HaveNotLikedPost
    );
  });

  it('UnlikePost case (another user post)', async () => {
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
      testUser,
    );

    const response = await mutate({
      mutation: mutations.unlikePost,
      variables: {
        postId
      }
    });

    expect(response.data.unlikePost.result).toEqual(false);
    expect(response.data.unlikePost.message).toEqual(
      ERROR_MESSAGES.Post.HaveNotLikedPost
    );
  });
});
