import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../components/Toast.js";
import type { Listing, Conversation, Message } from "../types/index.js";
import {
  ShieldCheck,
  CircleDot,
  Trash2,
  Edit2,
  CheckCircle,
  PlusCircle,
  MessageSquare,
  BadgeAlert,
  Send,
  Loader2,
  RefreshCw
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"listings" | "messages">("listings");
  
  // Chat state
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch user profile and stats
  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ["userProfileStats"],
    queryFn: async () => {
      const res = await api.get("/users/profile");
      return res.data?.data;
    },
  });

  // Fetch user listings
  const { data: listingsData, isLoading: loadingListings } = useQuery({
    queryKey: ["userListings"],
    queryFn: async () => {
      // get all listings of seller DRAFT, PENDING, VERIFIED, REJECTED, SOLD
      // wait, our backend `/listings` returns status VERIFIED by default, but if we query with status, it allows other statuses
      const resAll = await api.get(`/listings?sellerId=${user?.id}&status=DRAFT`);
      const resPending = await api.get(`/listings?sellerId=${user?.id}&status=PENDING`);
      const resVerified = await api.get(`/listings?sellerId=${user?.id}&status=VERIFIED`);
      const resRejected = await api.get(`/listings?sellerId=${user?.id}&status=REJECTED`);
      const resSold = await api.get(`/listings?sellerId=${user?.id}&status=SOLD`);

      const list = [
        ...(resAll.data?.data?.listings || []),
        ...(resPending.data?.data?.listings || []),
        ...(resVerified.data?.data?.listings || []),
        ...(resRejected.data?.data?.listings || []),
        ...(resSold.data?.data?.listings || []),
      ];

      // Remove duplicates based on ID (just in case)
      const uniqueListings = Array.from(new Map(list.map((item) => [item.id, item])).values());
      return uniqueListings as Listing[];
    },
    enabled: !!user?.id,
  });

  // Fetch active conversations
  const { data: conversationsData, isLoading: loadingConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await api.get("/messages/conversations");
      return res.data?.data?.conversations as Conversation[];
    },
    enabled: activeTab === "messages",
  });

  // Fetch chat history
  const { data: chatData, refetch: refetchChat, isLoading: loadingChat } = useQuery({
    queryKey: ["chatHistory", selectedConversation?.listing.id, selectedConversation?.otherUser.id],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const res = await api.get(
        `/messages/conversation/${selectedConversation.otherUser.id}?listingId=${selectedConversation.listing.id}`
      );
      return res.data?.data?.messages as Message[];
    },
    enabled: !!selectedConversation,
  });

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatData, selectedConversation]);

  // Mark as Sold Mutation
  const markAsSoldMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const listing = listingsData?.find((l) => l.id === listingId);
      if (!listing) return;
      const res = await api.put(`/listings/${listingId}`, {
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        platform: listing.platform,
        accountLevel: listing.accountLevel,
        country: listing.country,
        status: "SOLD",
      });
      return res.data;
    },
    onSuccess: () => {
      toast("Listing marked as SOLD", "success");
      queryClient.invalidateQueries({ queryKey: ["userListings"] });
      queryClient.invalidateQueries({ queryKey: ["userProfileStats"] });
    },
    onError: (err: any) => {
      toast(err.response?.data?.message || "Failed to update listing", "error");
    },
  });

  // Delete Listing Mutation
  const deleteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      await api.delete(`/listings/${listingId}`);
    },
    onSuccess: () => {
      toast("Listing deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["userListings"] });
      queryClient.invalidateQueries({ queryKey: ["userProfileStats"] });
    },
    onError: (err: any) => {
      toast(err.response?.data?.message || "Failed to delete listing", "error");
    },
  });

  // Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversation) return;
      const res = await api.post("/messages", {
        content,
        receiverId: selectedConversation.otherUser.id,
        listingId: selectedConversation.listing.id,
      });
      return res.data?.data?.message;
    },
    onSuccess: () => {
      setChatMessage("");
      queryClient.invalidateQueries({
        queryKey: ["chatHistory", selectedConversation?.listing.id, selectedConversation?.otherUser.id],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const handleDeleteClick = (listingId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this listing?")) {
      deleteMutation.mutate(listingId);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    sendMessageMutation.mutate(chatMessage.trim());
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

      {/* Stats Cards Grid */}
      {loadingProfile ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-900/40 border border-gray-850 h-24 rounded-2xl"></div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <div className="bg-[#111827]/40 border border-gray-800 p-5 rounded-2xl">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Total Listings</span>
            <span className="text-3xl font-black text-white block mt-1">{stats.TOTAL}</span>
          </div>
          <div className="bg-[#111827]/40 border border-gray-800 p-5 rounded-2xl border-l-4 border-l-blue-500">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block text-blue-400">Verified</span>
            <span className="text-3xl font-black text-white block mt-1">{stats.VERIFIED}</span>
          </div>
          <div className="bg-[#111827]/40 border border-gray-800 p-5 rounded-2xl border-l-4 border-l-amber-500">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block text-amber-400">Pending</span>
            <span className="text-3xl font-black text-white block mt-1">{stats.PENDING}</span>
          </div>
          <div className="bg-[#111827]/40 border border-gray-800 p-5 rounded-2xl border-l-4 border-l-rose-500">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block text-rose-400">Rejected</span>
            <span className="text-3xl font-black text-white block mt-1">{stats.REJECTED}</span>
          </div>
          <div className="bg-[#111827]/40 border border-gray-800 p-5 rounded-2xl border-l-4 border-l-emerald-500">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block text-emerald-400">Sold</span>
            <span className="text-3xl font-black text-white block mt-1">{stats.SOLD}</span>
          </div>
        </div>
      ) : null}

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
          className="pb-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 relative"
        >
          <span
            className={
              activeTab === "messages" ? "border-blue-500 text-white" : "border-transparent text-gray-400 hover:text-gray-200"
            }
          >
            Conversations
          </span>
        </button>
      </div>

      {/* ================= TAB 1: LISTINGS ================= */}
      {activeTab === "listings" && (
        <section>
          {loadingListings ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-900/40 border border-gray-850 h-20 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : !listingsData || listingsData.length === 0 ? (
            <div className="text-center py-16 border border-gray-800 bg-slate-900/10 rounded-2xl">
              <p className="text-gray-400 font-medium mb-3">You haven't listed any accounts yet.</p>
              <Link
                to="/listings/create"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
              >
                List Your First Account
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-850 bg-[#111827]/25 backdrop-blur-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-850 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <th className="py-4 px-6">Account Details</th>
                    <th className="py-4 px-6">Platform</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Verification</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850 text-sm text-gray-300">
                  {listingsData.map((listing) => (
                    <tr key={listing.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-4 px-6">
                        <Link to={`/listings/${listing.id}`} className="font-semibold text-white hover:text-blue-400 transition-colors block">
                          {listing.title}
                        </Link>
                        <span className="text-[10px] text-gray-500 block mt-1">ID: {listing.id.substring(0, 8)}...</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-medium bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md text-gray-300">
                          {listing.platform}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-white">${listing.price.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        {listing.status === "VERIFIED" && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        )}
                        {listing.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-950/20 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                            <CircleDot className="w-3.5 h-3.5" />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {listing.status === "REJECTED" && (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center gap-1 text-xs text-rose-400 bg-rose-950/20 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                              <BadgeAlert className="w-3.5 h-3.5" />
                              <span>Rejected</span>
                            </span>
                            {listing.rejectionReason && (
                              <span className="text-[10px] text-rose-300 font-medium block italic max-w-xs truncate" title={listing.rejectionReason}>
                                Reason: {listing.rejectionReason}
                              </span>
                            )}
                          </div>
                        )}
                        {listing.status === "SOLD" && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
                            <span>Sold</span>
                          </span>
                        )}
                        {listing.status === "DRAFT" && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-900 border border-gray-800 px-2.5 py-0.5 rounded-full font-semibold">
                            <span>Draft</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {listing.status !== "SOLD" && listing.status !== "PENDING" && (
                            <button
                              onClick={() => markAsSoldMutation.mutate(listing.id)}
                              disabled={markAsSoldMutation.isPending}
                              title="Mark as Sold"
                              className="p-2 rounded-lg bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/30 border border-emerald-500/20 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            to={`/listings/${listing.id}/edit`}
                            title="Edit Listing"
                            className="p-2 rounded-lg bg-slate-900 text-gray-400 hover:text-white border border-gray-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(listing.id)}
                            title="Delete Listing"
                            className="p-2 rounded-lg bg-rose-950/20 text-rose-400 hover:bg-rose-900/30 border border-rose-500/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ================= TAB 2: CONVERSATIONS ================= */}
      {activeTab === "messages" && (
        <section>
          {loadingConversations ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : !conversationsData || conversationsData.length === 0 ? (
            <div className="text-center py-16 border border-gray-800 bg-slate-900/10 rounded-2xl">
              <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No chat conversations yet.</p>
              <p className="text-xs text-gray-500 mt-1">When buyers contact you about listings, the chats will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-850 bg-[#111827]/10 rounded-2xl overflow-hidden h-[500px]">
              {/* Threads Sidebar */}
              <div className="col-span-1 border-r border-gray-850 overflow-y-auto divide-y divide-gray-850 bg-slate-950/10">
                {conversationsData.map((conv) => {
                  const isSelected = selectedConversation?.otherUser.id === conv.otherUser.id && selectedConversation?.listing.id === conv.listing.id;
                  return (
                    <button
                      key={`${conv.otherUser.id}-${conv.listing.id}`}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full text-left p-4 flex gap-3 transition-colors ${
                        isSelected ? "bg-slate-900/70 border-l-4 border-l-blue-500" : "hover:bg-slate-900/25"
                      }`}
                    >
                      {conv.otherUser.avatar ? (
                        <img src={conv.otherUser.avatar} alt={conv.otherUser.name} className="w-10 h-10 rounded-full object-cover border border-gray-700" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                          {conv.otherUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-semibold text-white truncate">{conv.otherUser.name}</h4>
                          <span className="text-[9px] text-gray-500 shrink-0">
                            {new Date(conv.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <p className="text-[10px] text-blue-400 font-medium truncate mt-0.5">Re: {conv.listing.title}</p>
                        <p className="text-xs text-gray-400 truncate mt-1">{conv.content}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Chat messages box */}
              <div className="col-span-2 flex flex-col justify-between h-full bg-[#0c111e]/10">
                {selectedConversation ? (
                  <>
                    {/* Header */}
                    <div className="bg-[#0b0f19]/70 border-b border-gray-850 p-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-white">{selectedConversation.otherUser.name}</h3>
                        <span className="text-[10px] text-blue-400 leading-none block mt-0.5">
                          Listing: {selectedConversation.listing.title} (${selectedConversation.listing.price})
                        </span>
                      </div>
                      <button
                        onClick={() => refetchChat()}
                        title="Refresh Messages"
                        className="text-gray-400 hover:text-white p-1 rounded-md"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-grow p-4 overflow-y-auto space-y-4">
                      {loadingChat ? (
                        <div className="h-full flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        </div>
                      ) : (
                        chatData?.map((msg) => {
                          const isOwn = msg.senderId === user?.id;
                          return (
                            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                                  isOwn
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-slate-800 text-gray-200 rounded-bl-none border border-gray-700/50"
                                }`}
                              >
                                <p className="break-words">{msg.content}</p>
                                <span className={`text-[8px] block mt-1.5 text-right ${isOwn ? "text-blue-200" : "text-gray-500"}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Form Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-850 bg-[#0b0f19]/70 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        disabled={sendMessageMutation.isPending}
                        className="flex-grow bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 text-sm text-white px-4 py-2.5 rounded-xl disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={sendMessageMutation.isPending || !chatMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-colors shrink-0"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-2">
                    <MessageSquare className="w-12 h-12 text-gray-700" />
                    <p className="font-semibold text-sm">Select a Conversation</p>
                    <p className="text-xs text-gray-600">Select a chat thread from the left list to read messages and reply.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
