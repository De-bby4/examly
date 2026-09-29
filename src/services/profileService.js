import api from "./api";

export const getProfile = () =>
  api.get("/auth/profile").then((res) => res.data);

export const updateProfile = (name) =>
  api.put("/auth/profile", { name }).then((res) => res.data);

export const updateProfilePicture = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post("/auth/profile/picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};