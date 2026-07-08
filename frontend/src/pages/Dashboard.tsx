import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../stores/useAuthStore";
import { useListingStore } from "../stores/useListingStore";
import { useChatStore } from "../stores/useChatStore";
import { useToast } from "../components/Toast.js";
import type { Conversation } from "../types/index.js";
import StatsCards from "../components/StatsCards.js";
import UserListingsTable from "../components/UserListingsTable.js";
import DashboardConversations from "../components/DashboardConversations.js";
import { PlusCircle } from "lucide-react";

const Dashboard = () => {
  const user = useAuthStore((state) => state.authUser);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"listings" | "messages">("listings");
  
  // Chat state
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Profile Stats state (local since it's user-specific stats details)
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Listing store hooks
  const userListings = useListingStore((state) => state.userListings);
  const loadingListings = useListingStore((state) => state.isLoading);
  const fetchUserListings = useListingStore((state) => state.fetchUserListings);
  const deleteListing = useListingStore((state) => state.deleteListing);
  const markAsSold = useListingStore((state) => state.markAsSold);

  // Chat store hooks
  const conversations = useChatStore((state) => state.conversations);
  const chatHistory = useChatStore((state) => state.chatHistory);
  const loadingConversations = useChatStore((state) => state.loadingConversations);
  const loadingChat = useChatStore((state) => state.loadingChat);
  const sendingMessage = useChatStore((state) => state.sendingMessage);
  const fetchConversations = useChatStore((state) => state.fetchConversations);
  const fetchChatHistory = useChatStore((state) => state.fetchChatHistory);
  const sendMessage = useChatStore((state) => state.sendMessage);

  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Fetch user profile and stats
  const fetchProfileData = async () => {
    setLoadingProfile(true);
    try {
      const res = await axiosInstance.get("/users/profile");
      setProfileData(res.data?.data);
    } catch (err) {
      console.error("Failed to fetch profile stats:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Trigger loads on mount/updates
  useEffect(() => {
    fetchProfileData();
    return () => {
      useChatStore.getState().clearActiveChat();
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserListings(user.id);
    }
  }, [user?.id, fetchUserListings]);

  useEffect(() => {
    if (activeTab === "messages") {
      fetchConversations();
    } else {
      useChatStore.getState().clearActiveChat();
    }
  }, [activeTab, fetchConversations]);

  const refetchChat = () => {
    if (selectedConversation) {
      fetchChatHistory(selectedConversation.otherUser.id, selectedConversation.listing.id);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      refetchChat();
    } else {
      useChatStore.getState().clearActiveChat();
    }
  }, [selectedConversation]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, selectedConversation]);

  // Actions
  const handleMarkAsSold = async (listingId: string) => {
    const targetListing = userListings.find((l) => l.id === listingId);
    if (!targetListing) return;
    setActionInProgress(listingId);
    try {
      await markAsSold(listingId, {
        title: targetListing.title,
        description: targetListing.description,
        price: targetListing.price,
        category: targetListing.category,
        platform: targetListing.platform,
        accountLevel: targetListing.accountLevel,
        country: targetListing.country,
      });
      toast("Listing marked as SOLD", "success");
      fetchProfileData();
    } catch (err: any) {
      toast(err.response?.data?.message || "Failed to update listing", "error");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteClick = async (listingId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this listing?")) return;
    setActionInProgress(listingId);
    try {
      await deleteListing(listingId);
      toast("Listing deleted successfully", "success");
      fetchProfileData();
    } catch (err: any) {
      toast(err.response?.data?.message || "Failed to delete listing", "error");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedConversation || sendingMessage) return;
    try {
      await sendMessage(chatMessage.trim(), selectedConversation.otherUser.id, selectedConversation.listing.id);
      setChatMessage("");
    } catch (err: any) {
      toast(err.response?.data?.message || "Failed to send message", "error");
    }
  };

  const stats = profileData?.stats;

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400">Manage listings, monitor verification statuses, and view conversations</p>
        </div>
        <Link
          to="/listings/create"
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Listing</span>
        </Link>
      </div>

      <StatsCards loading={loadingProfile} stats={stats} />

      {/* Tabs */}
      <div className="flex border-b border-gray-850 mb-8">
        <button
          onClick={() => setActiveTab("listings")}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "listings"
              ? "border-blue-500 text-white"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          My Listings
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "messages"
              ? "border-blue-500 text-white"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Conversations
        </button>
      </div>

      {/* ================= TAB 1: LISTINGS ================= */}
      {activeTab === "listings" && (
        <section>
          <UserListingsTable
            loading={loadingListings}
            listings={userListings}
            actionInProgress={actionInProgress}
            onMarkAsSold={handleMarkAsSold}
            onDelete={handleDeleteClick}
          />
        </section>
      )}

      {/* ================= TAB 2: CONVERSATIONS ================= */}
      {activeTab === "messages" && (
        <section>
          <DashboardConversations
            loadingConversations={loadingConversations}
            conversations={conversations}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            refetchChat={refetchChat}
            loadingChat={loadingChat}
            chatHistory={chatHistory}
            chatEndRef={chatEndRef}
            handleSendMessage={handleSendMessage}
            chatMessage={chatMessage}
            setChatMessage={setChatMessage}
            sendingMessage={sendingMessage}
            currentUser={user}
          />
        </section>
      )}
    </div>
  );
};

export default Dashboard;

