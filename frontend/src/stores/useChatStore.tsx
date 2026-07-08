import { create } from "zustand";
import { io as socketIo, Socket } from "socket.io-client";
import { axiosInstance } from "../lib/axios";
import type { Conversation, Message } from "../types";

interface ChatState {
  conversations: Conversation[];
  chatHistory: Message[];
  loadingConversations: boolean;
  loadingChat: boolean;
  sendingMessage: boolean;
  onlineUsers: string[];
  socket: Socket | null;
  activeChatUserId: string | null;
  activeChatListingId: string | null;
  fetchConversations: () => Promise<void>;
  fetchChatHistory: (otherUserId: string, listingId: string) => Promise<void>;
  sendMessage: (content: string, receiverId: string, listingId: string) => Promise<void>;
  connectSocket: (userId: string) => void;
  disconnectSocket: () => void;
  clearActiveChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  chatHistory: [],
  loadingConversations: false,
  loadingChat: false,
  sendingMessage: false,
  onlineUsers: [],
  socket: null,
  activeChatUserId: null,
  activeChatListingId: null,

  fetchConversations: async () => {
    set({ loadingConversations: true });
    try {
      const res = await axiosInstance.get("/messages/conversations");
      set({ conversations: res.data?.data?.conversations || [], loadingConversations: false });
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      set({ loadingConversations: false });
    }
  },

  fetchChatHistory: async (otherUserId, listingId) => {
    set({ loadingChat: true, activeChatUserId: otherUserId, activeChatListingId: listingId });
    try {
      const res = await axiosInstance.get(
        `/messages/conversation/${otherUserId}?listingId=${listingId}`
      );
      set({ chatHistory: res.data?.data?.messages || [], loadingChat: false });
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
      set({ loadingChat: false });
    }
  },

  sendMessage: async (content, receiverId, listingId) => {
    set({ sendingMessage: true });
    try {
      const res = await axiosInstance.post("/messages", {
        content,
        receiverId,
        listingId,
      });
      set({ sendingMessage: false });

      // Append own sent message to local chat history for instant display
      const newMessage = res.data?.data?.message;
      if (newMessage) {
        set({ chatHistory: [...get().chatHistory, newMessage] });
      }

      // Refetch conversations list to update latest messages
      get().fetchConversations();
    } catch (err) {
      console.error("Failed to send message:", err);
      set({ sendingMessage: false });
      throw err;
    }
  },

  connectSocket: (userId) => {
    if (get().socket?.connected) return;

    let BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    try {
      BASE_URL = new URL(BASE_URL).origin;
    } catch (err) {
      console.error("Invalid VITE_API_URL, using default:", err);
    }

    const socket = socketIo(BASE_URL, {
      autoConnect: true,
      withCredentials: true,
    });

    socket.emit("setup", userId);

    socket.on("get-online-users", (users: string[]) => {
      set({ onlineUsers: users });
    });

    socket.on("receive-message", (message: Message) => {
      const { activeChatUserId, activeChatListingId } = get();
      
      const isCurrentChat = 
        message.listingId === activeChatListingId &&
        (message.senderId === activeChatUserId || message.receiverId === activeChatUserId);

      if (isCurrentChat) {
        set({ chatHistory: [...get().chatHistory, message] });
      }

      get().fetchConversations();
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },

  clearActiveChat: () => {
    set({ activeChatUserId: null, activeChatListingId: null, chatHistory: [] });
  },
}));
