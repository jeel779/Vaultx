import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import type { Listing } from "../types";

interface ListingState {
  listings: Listing[];
  latestListings: Listing[];
  currentListing: Listing | null;
  relatedListings: Listing[];
  userListings: Listing[];
  isLoading: boolean;
  error: any;
  pagination: any;
  fetchLatestListings: () => Promise<void>;
  fetchListings: (params: Record<string, string>) => Promise<void>;
  fetchListingDetails: (id: string) => Promise<void>;
  fetchUserListings: (userId: string) => Promise<void>;
  createListing: (formData: any) => Promise<Listing>;
  updateListing: (id: string, data: any) => Promise<Listing>;
  deleteListing: (id: string) => Promise<void>;
  markAsSold: (id: string, listingDetails: any) => Promise<void>;
}

export const useListingStore = create<ListingState>((set) => ({
  listings: [],
  latestListings: [],
  currentListing: null,
  relatedListings: [],
  userListings: [],
  isLoading: false,
  error: null,
  pagination: null,

  fetchLatestListings: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/listings?limit=4&sortBy=newest");
      set({ latestListings: res.data?.data?.listings || [], isLoading: false });
    } catch (err: any) {
      set({ error: err, isLoading: false });
    }
  },

  fetchListings: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val) searchParams.append(key, val);
      });
      const res = await axiosInstance.get(`/listings?${searchParams.toString()}`);
      set({
        listings: res.data?.data?.listings || [],
        pagination: res.data?.data?.pagination || null,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err, isLoading: false });
    }
  },

  fetchListingDetails: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(`/listings/${id}`);
      set({
        currentListing: res.data?.data?.listing || null,
        relatedListings: res.data?.data?.relatedListings || [],
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err, isLoading: false });
    }
  },

  fetchUserListings: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const statuses = ["DRAFT", "PENDING", "VERIFIED", "REJECTED", "SOLD"];
      const fetchPromises = statuses.map((status) =>
        axiosInstance.get(`/listings?sellerId=${userId}&status=${status}`).catch(() => ({ data: { data: { listings: [] } } }))
      );
      
      const responses = await Promise.all(fetchPromises);
      const list: Listing[] = [];
      responses.forEach((res) => {
        if (res.data?.data?.listings) {
          list.push(...res.data.data.listings);
        }
      });

      // Remove duplicates based on ID
      const uniqueListings = Array.from(new Map(list.map((item) => [item.id, item])).values());
      set({ userListings: uniqueListings, isLoading: false });
    } catch (err: any) {
      set({ error: err, isLoading: false });
    }
  },

  createListing: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post("/listings", formData);
      set({ isLoading: false });
      return res.data?.data?.listing;
    } catch (err: any) {
      set({ error: err, isLoading: false });
      throw err;
    }
  },

  updateListing: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.put(`/listings/${id}`, data);
      set({ isLoading: false });
      return res.data?.data?.listing;
    } catch (err: any) {
      set({ error: err, isLoading: false });
      throw err;
    }
  },

  deleteListing: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/listings/${id}`);
      set((state) => ({
        userListings: state.userListings.filter((l) => l.id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err, isLoading: false });
      throw err;
    }
  },

  markAsSold: async (id, listingDetails) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.put(`/listings/${id}`, {
        ...listingDetails,
        status: "SOLD",
      });
      set((state) => ({
        userListings: state.userListings.map((l) =>
          l.id === id ? { ...l, status: "SOLD" } : l
        ),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err, isLoading: false });
      throw err;
    }
  },
}));
