import API from "./axios";

export const likePost = async (postId) => {
  return API.post(`/posts/${postId}/like`);
};
export const unlikePost = async (postId) => {
  return API.delete(`/posts/${postId}/like`);
};

export const bookmarkPost = async (postId) => {
  return API.post(`/posts/${postId}/bookmark`);
};
export const unbookmarkPost = async (postId) => {
  return API.delete(`/posts/${postId}/bookmark`);
};
