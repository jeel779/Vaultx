import { axiosInstance } from "../lib/axios";

export const loginUser = async (email: string, password: string) => {
  const res = await axiosInstance.post("/auth/login", { email, password });
  if (res.status !== 200) {
    throw new Error("Failed to login");
  } 
  return res.data;
};

export const signupUser = async (
  name: string,
  email: string,
  password: string,
  adminSecret?: string
) => {
  const res = await axiosInstance.post("/auth/register", {
    name,
    email,
    password,
    adminSecret,
  });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error("Unable to Signup");
  }
  return res.data;
};

export const checkAuthStatus = async () => {
  const res = await axiosInstance.get("/auth/me");
  if (res.status !== 200) {
    throw new Error("Unable to authenticate");
  }
  return res.data;
};

export const logoutUser = async () => {
  const res = await axiosInstance.post("/auth/logout");
  if (res.status !== 200) {
    throw new Error("Unable to logout");
  }
  return res.data;
};

export const updateUserProfileApi = async (name: string, avatarFile?: File | null) => {
  const formData = new FormData();
  formData.append("name", name);
  if (avatarFile) {
    formData.append("avatar", avatarFile);
  }
  const res = await axiosInstance.put("/users/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  if (res.status !== 200) {
    throw new Error("Failed to update profile");
  }
  return res.data;
};