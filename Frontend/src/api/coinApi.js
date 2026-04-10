import API from "./axios";

export const searchCoins = async (search = "") => {
  const response = await API.get("/coins", {
    params: { search },
  });

  return response.data;
};
