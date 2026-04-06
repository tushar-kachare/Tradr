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

export const createPost = async (formData) => {
  return API.post("/posts", formData);
};

export const shareTradePost = async ({ content, tradeId }) => {
  return API.post("/posts", {
    content,
    tradeId,
  });
};

export const getPostById = async (postId) => {
  return API.get(`/posts/${postId}`);
};
export const repostPost = async (formData) => {
  return API.post("/posts/", formData);
};
