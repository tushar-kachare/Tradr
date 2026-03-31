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
