import API from "./axios";

export const fetchProfile = async (username) => {
  const res =  await API.get(`/users/${username}`);
  return res.data;
}

export const fetchUserPosts = async (userId) => {
  const res = await API.get(`/users/${userId}/posts`);
  return res.data;
}