export const confirmPassword = `
  query ConfirmPassword($candidatePassword: String!) {
    confirmPassword(candidatePassword: $candidatePassword) {
      message
      result
    }
  }
`;

export const fetchNotifications = `
  query FetchNotifications {
    notifications {
      id
      destUser
      follower
      image
      post
      type
      content
      read
      createdAt
    }
  }
`;

export const fetchPost = `
  query FetchPost($id: String!) {
    post(id: $id) {
      id
      content
      images {
        source
      }
      tags
      beLiked
      createdAt
      numberLikes
      comments {
        id
        content
        user {
          id
          userName
          avatarURL
        }
      }
      user {
        id
        avatarURL
        userName
      }
    }
  }
`;

export const fetchPosts = `
  query FetchPosts($orderBy: OrderByType, $fromIndex: Int) {
    fetchPosts(orderBy: $orderBy, fromIndex: $fromIndex) {
      posts {
        id
        content
        images {
          source
        }
        tags
        createdAt
        numberLikes
        beLiked
        comments {
          id
          content
          user {
            id
            userName
            avatarURL
          }
        }
        user {
          id
          avatarURL
          userName
        }
      }
      canLoadMore
    }
  }
`;

export const fetchSuggestFriends = `
  query FetchSuggestFriends($limit: Int) {
    suggestFriends(limit: $limit) {
      message
      result
      users {
        id,
        userName,
        avatarURL,
        followers,
        following,
        posts,
      }
    }
  }
`;

export const fetchSuggestFriendsWithOutPosts = `
  query FetchSuggestFriends($limit: Int) {
    suggestFriends(limit: $limit) {
      message
      result
      users {
        id,
        userName,
        avatarURL,
        followers,
        following,
      }
    }
  }
`;

export const fetchUser = `
  query UserQuery($id: ID!) {
    user(id: $id) {
      avatarURL
      userName
      nickName
      followings {
        id
        avatarURL
        userName
      }
      followers {
        id
        avatarURL
        userName
      }
    }
  }
`;

export const fetchUserWithOutPosts = `
  query UserQuery($id: ID!) {
    user(id: $id) {
      email
      avatarURL
      userName
      nickName
      followings {
        id
        avatarURL
        userName
      }
      followers {
        id
        avatarURL
        userName
      }
      posts {
        id
        content
        tags
        images {
          source
        }
        comments {
          id
          content
          user {
            id
            userName
            avatarURL
          }
        }
        numberLikes
        createdAt
      }
    }
  }
`;

export const isFollowingUser = `
  query IsFollowingUser($userId: ID!) {
    isFollowingUser(userId: $userId) {
      message
      result
    }
  }
`;
