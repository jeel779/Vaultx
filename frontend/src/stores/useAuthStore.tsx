import { create } from "zustand";
import {
  checkAuthStatus,
  signupUser,
  loginUser,
  logoutUser,
  updateUserProfileApi,
} from "../helpers/api-communicator";
import type { User } from "../types/index";

interface AuthStore {
  authUser: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  signup: (name: string, email: string, password: string, adminSecret?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, avatarFile?: File | null) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authUser: null,
  isLoggedIn: false,
  isLoading: false,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const resData = await checkAuthStatus();
      if (resData && resData.data && resData.data.user) {
        set({ authUser: resData.data.user, isLoggedIn: true });
      } else {
        set({ authUser: null, isLoggedIn: false });
      }
    } catch (error) {
      console.error("checkAuth failed:", error);
      set({ authUser: null, isLoggedIn: false });
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (name: string, email: string, password: string, adminSecret?: string) => {
    set({ isLoading: true });
    try {
      const resData = await signupUser(name, email, password, adminSecret);
      if (resData && resData.data && resData.data.user) {
        set({ authUser: resData.data.user, isLoggedIn: true });
      }
    } catch (error) {
      console.error("signup failed:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const resData = await loginUser(email, password);
      if (resData && resData.data && resData.data.user) {
        set({ authUser: resData.data.user, isLoggedIn: true });
      }
    } catch (error) {
      console.error("login failed:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutUser();
      set({ authUser: null, isLoggedIn: false });
    } catch (error) {
      console.error("logout failed:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (name: string, avatarFile?: File | null) => {
    set({ isLoading: true });
    try {
      const resData = await updateUserProfileApi(name, avatarFile);
      if (resData && resData.data && resData.data.user) {
        set({ authUser: resData.data.user });
      }
    } catch (error) {
      console.error("updateProfile failed:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));