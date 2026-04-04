import API from "./axios";

export const fetchExplorePosts = async (params) => {
  return API.get("/posts/explore", { params });
};

export const fetchFeedPosts = async (params) => {
  return API.get("/posts/feed", { params });
};
