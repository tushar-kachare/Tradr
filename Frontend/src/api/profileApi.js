import API from "./axios";

export const fetchProfile = async (username) => {
  const res = await API.get(`/users/${username}`);
  return res.data;
};

export const fetchUserPosts = async (userId) => {
  const res = await API.get(`/users/${userId}/posts`);
  return res.data;
};
export const followUser = async (username) => {
  console.log(username);

  await API.post(`/users/${username}/follow`);
};
export const unFollowUser = async (username) => {
  await API.delete(`/users/${username}/follow`);
};
export const fetchUserLikes = async (userId) => {
  const res = await API.get(`/users/${userId}/likes`);
  return res.data;
};
export const fetchUserBookmarks = async (userId) => {
  const res = await API.get(`/users/${userId}/bookmarks`);
  return res.data;
};

export const fetchFollowers = async (username) => {
  const res = await API.get(`/users/${username}/followers`);
  return res.data;
};

export const fetchFollowing = async (username) => {
  const res = await API.get(`/users/${username}/following`);
  return res.data;
};
