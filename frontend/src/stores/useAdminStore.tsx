import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import type { Listing, User } from "../types";

interface AdminUser extends User {
  listingsCount: number;
}

interface AdminState {
  pendingListings: Listing[];
  users: AdminUser[];
  loadingPending: boolean;
  loadingUsers: boolean;
  actionId: string | null;
  fetchPendingListings: () => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  approveListing: (listingId: string) => Promise<void>;
  rejectListing: (listingId: string, reason: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  pendingListings: [],
  users: [],
  loadingPending: false,
  loadingUsers: false,
  actionId: null,

  fetchPendingListings: async () => {
    set({ loadingPending: true });
    try {
      const res = await axiosInstance.get("/admin/listings/pending");
      set({ pendingListings: res.data?.data?.listings || [], loadingPending: false });
    } catch (err) {
      console.error("Failed to fetch pending listings:", err);
      set({ loadingPending: false });
    }
  },

  fetchAllUsers: async () => {
    set({ loadingUsers: true });
    try {
      const res = await axiosInstance.get("/admin/users");
      set({ users: res.data?.data?.users || [], loadingUsers: false });
    } catch (err) {
      console.error("Failed to fetch users:", err);
      set({ loadingUsers: false });
    }
  },

  approveListing: async (listingId) => {
    set({ actionId: listingId });
    try {
      await axiosInstance.patch(`/admin/listings/${listingId}/approve`);
      set({ actionId: null });
      await get().fetchPendingListings();
    } catch (err) {
      set({ actionId: null });
      throw err;
    }
  },

  rejectListing: async (listingId, reason) => {
    set({ actionId: listingId });
    try {
      await axiosInstance.patch(`/admin/listings/${listingId}/reject`, {
        rejectionReason: reason,
      });
      set({ actionId: null });
      await get().fetchPendingListings();
    } catch (err) {
      set({ actionId: null });
      throw err;
    }
  },

  deleteUser: async (userId) => {
    set({ actionId: userId });
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      set({ actionId: null });
      await get().fetchAllUsers();
    } catch (err) {
      set({ actionId: null });
      throw err;
    }
  },
}));
