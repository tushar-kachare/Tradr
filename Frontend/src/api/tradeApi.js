import API from "./axios";

export const createTrade = (payload) => API.post("/trades", payload);
