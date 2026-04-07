import API from "./axios";

export const searchUser = async (query, limit = 5) => {
  return API.get(`/users/search?q=${query}&limit=${limit}`);
};

export const getTopUsers = async (limit = 5) => {
  return API.get(`/users/top/?limit=${limit}`);
};
