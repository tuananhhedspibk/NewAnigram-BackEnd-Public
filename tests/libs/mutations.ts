export const activeAccount = `
  mutation ActiveAccount($uid: ID!, $key: String!) {
    activeAccount(uid: $uid, key: $key) {
      message
      result
      user {
        id
        email
        avatarURL
        userName
        nickName
      }
      token
    }
  }
`;

export const markNotificationAsReadByBatch = `
  mutation BatchMarkNotificationAsRead($ids: [ID]) {
    markNotificationAsReadByBatch(ids: $ids) {
      message
      result
    }
  }
`;

export const commentPost = `
  mutation CommentPost($postId: ID!, $commentContent: String!) {
    commentPost(postId: $postId, commentContent: $commentContent) {
      message
      result
    }
  }
`;

export const createPost = `
  mutation CreatePost($id: String!, $content: String, $images: [String], $tags: [String]) {
    createPost(id: $id, content: $content, images: $images, tags: $tags) {
      message
      result
    }
  }
`;

export const followUser = `
  mutation FollowUser($followingUserId: ID!) {
    followUser(followingUserId: $followingUserId) {
      message
      result
    }
  }
`;

export const genS3GetURL = `
  mutation genS3GetURL($key: String!) {
    s3GetURL(key: $key) {
      url
      result
    }
  }
`;

export const genS3PutURL = `
  mutation genS3PutURL($key: String!, $contentType: String!) {
    s3PutURL(key: $key, contentType: $contentType) {
      url
      result
    }
  }
`;

export const likePost = `
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      message
      result
    }
  }
`;

export const markNotificationAsRead = `
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      message
      result
    }
  }
`;

export const signIn = `
  mutation SignIn($email: String, $password: String) {
    signIn(email: $email, password: $password) {
      user {
        id
        email
        avatarURL
        userName
        nickName
      }
      token
      message
      result
    }
  }
`;

export const signUp = `
  mutation SignUp($email: String, $password: String) {
    signUp(email: $email, password: $password) {
      user {
        id
        email
        avatarURL
        userName
        nickName
      }
      token
      message
      result
    }
  }
`;

export const unfollowUser = `
  mutation UnfollowUser($unfollowUserId: ID!) {
    unfollowUser(unfollowUserId: $unfollowUserId) {
      message
      result
    }
  }
`;

export const unlikePost = `
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId) {
      message
      result
    }
  }
`;

export const updateUser = `
  mutation UpdateUser(
    $id: ID!,
    $email: String,
    $password: String,
    $avatarURL: String,
    $userName: String,
    $nickName: String
  ) {
    updateUser(
      id: $id,
      email: $email,
      password: $password,
      avatarURL: $avatarURL,
      userName: $userName,
      nickName: $nickName
    ) {
      message
      result
    }
  }
`;
