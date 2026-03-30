import API from "./axios";

export const fetchExplorePosts = async () => {
  return API.get("/posts/explore");
};

export const fetchFeedPosts = async () => {
  return API.get("/posts/feed");
};
