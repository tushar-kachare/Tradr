import API from "./axios";

export const updateMyProfile = async (payload) => {
  const res = await API.patch("/users/me", payload);
  return res.data;
};

export const updateMyAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await API.patch("/users/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
