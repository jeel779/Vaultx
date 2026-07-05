import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../components/Toast.js";
import type { Listing, Message } from "../types/index.js";
import ListingCard from "../components/ListingCard.js";
import {
  ShieldCheck,
  MapPin,
  Layers,
  Calendar,
  MessageSquare,
  ChevronLeft,
  Send,
  X,
  Loader2,
  RefreshCw
} from "lucide-react";

const ListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch listing details and related listings
  const { data, isLoading, error } = useQuery({
    queryKey: ["listingDetails", id],
    queryFn: async () => {
      const res = await api.get(`/listings/${id}`);
      return res.data?.data;
    },
    enabled: !!id,
  });

  const listing = data?.listing as Listing | undefined;
  const relatedListings = data?.relatedListings as Listing[] | undefined;

  // Reset active image when listing changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [id]);

  // Fetch chat history with seller
  const { data: chatData, refetch: refetchChat, isLoading: loadingChat } = useQuery({
    queryKey: ["chatHistory", id, listing?.sellerId],
    queryFn: async () => {
      const res = await api.get(`/messages/conversation/${listing?.sellerId}?listingId=${id}`);
      return res.data?.data?.messages as Message[];
    },
    enabled: chatModalOpen && !!listing?.sellerId && !!id && isAuthenticated,
  });

  // Auto-scroll to bottom of chat when new messages load
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatData, chatModalOpen]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post("/messages", {
        content,
        receiverId: listing?.sellerId,
        listingId: id,
      });
      return res.data?.data?.message;
    },
    onSuccess: () => {
      setChatMessage("");
      queryClient.invalidateQueries({ queryKey: ["chatHistory", id, listing?.sellerId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: any) => {
      toast(err.response?.data?.message || "Failed to send message", "error");
    },
  });

  const handleContactClick = () => {
    if (!isAuthenticated) {
      toast("Please sign in to contact the seller", "info");
      navigate("/login", { state: { from: location } });
      return;
    }
    setChatModalOpen(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    sendMessageMutation.mutate(chatMessage.trim());
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Listing Not Found</h2>
        <p className="text-gray-400 mb-6">The listing you are trying to view does not exist or has been deleted.</p>
        <Link to="/explore" className="bg-slate-900 border border-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
          Browse Explore Feed
        </Link>
      </div>
    );
  }

  const isSeller = user?.id === listing.sellerId;

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Back button */}
      <Link to="/explore" className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Explore</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* ================= LEFT COLUMN: IMAGES GALLERY ================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Display */}
          <div className="relative bg-slate-950 aspect-video w-full rounded-2xl overflow-hidden border border-gray-800">
            <img
              src={listing.images[activeImageIndex]?.imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1280"}
              alt={`${listing.title} preview`}
              className="w-full h-full object-contain"
            />
            {listing.status === "SOLD" && (
              <div className="absolute inset-0 bg-[#070b13]/80 backdrop-blur-sm flex items-center justify-center">
                <span className="border border-rose-500/50 text-rose-400 bg-rose-950/20 text-lg font-bold uppercase tracking-widest px-6 py-2 rounded-xl">
                  Sold Out
                </span>
              </div>
            )}
            {listing.status === "VERIFIED" && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-blue-400/30">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Ownership</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {listing.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {listing.images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative aspect-video w-24 rounded-xl overflow-hidden border-2 bg-slate-950 transition-all shrink-0 ${
                    index === activeImageIndex ? "border-blue-500" : "border-transparent hover:border-gray-700"
                  }`}
                >
                  <img src={img.imageUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= RIGHT COLUMN: LISTING INFO ================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top badges */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-blue-400 bg-blue-950/40 border border-blue-900/30 px-2.5 py-1 rounded-md">
              {listing.platform}
            </span>
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 bg-slate-800/40 border border-slate-700/30 px-2.5 py-1 rounded-md">
              {listing.category}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
              {listing.title}
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Posted on {new Date(listing.createdAt).toLocaleDateString()}</span>
            </p>
          </div>

          {/* Price Banner */}
          <div className="bg-slate-900/50 border border-gray-800/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-medium">Price</span>
              <p className="text-3xl font-black text-white mt-1">${listing.price.toLocaleString()}</p>
            </div>

            {/* Contact Seller / Action button */}
            {isSeller ? (
              <Link
                to={`/listings/${listing.id}/edit`}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-750 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all"
              >
                Edit Listing
              </Link>
            ) : listing.status === "SOLD" ? (
              <button
                disabled
                className="bg-gray-900 border border-gray-850 text-gray-600 font-semibold text-sm px-6 py-3 rounded-xl cursor-not-allowed"
              >
                Sold Out
              </button>
            ) : (
              <button
                onClick={handleContactClick}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Seller</span>
              </button>
            )}
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0f172a]/30 border border-gray-850 p-4 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Account Level</span>
                <span className="text-sm font-semibold text-white">Level {listing.accountLevel}</span>
              </div>
            </div>

            <div className="bg-[#0f172a]/30 border border-gray-850 p-4 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-500/10 text-gray-400 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Country</span>
                <span className="text-sm font-semibold text-white">{listing.country}</span>
              </div>
            </div>
          </div>

          {/* Seller Information */}
          <div className="bg-slate-900/30 border border-gray-850 p-5 rounded-2xl">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Seller Details</h3>
            <div className="flex items-center gap-3">
              {listing.seller.avatar ? (
                <img
                  src={listing.seller.avatar}
                  alt={listing.seller.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-base font-bold">
                  {listing.seller.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold text-white">{listing.seller.name}</h4>
                <p className="text-xs text-gray-400">
                  Joined VaultX {listing.seller.createdAt ? new Date(listing.seller.createdAt).toLocaleDateString() : "recently"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Account Description</h3>
            <p className="text-sm text-gray-300 leading-relaxed bg-[#0f172a]/20 border border-gray-850 p-5 rounded-2xl whitespace-pre-line">
              {listing.description}
            </p>
          </div>
        </div>
      </div>

      {/* ================= RELATED LISTINGS ================= */}
      {relatedListings && relatedListings.length > 0 && (
        <section className="border-t border-gray-900 pt-16">
          <h2 className="text-xl font-bold text-white mb-8">Related Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedListings.map((rel) => (
              <div key={rel.id}>
                <ListingCard listing={rel} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= CHAT OVERLAY MODAL ================= */}
      {chatModalOpen && listing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-gray-800 rounded-2xl max-w-lg w-full h-[550px] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-[#0b0f19] border-b border-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {listing.seller.avatar ? (
                  <img
                    src={listing.seller.avatar}
                    alt={listing.seller.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {listing.seller.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-white">{listing.seller.name}</h3>
                  <span className="text-[10px] text-gray-500 block leading-none mt-0.5 line-clamp-1">
                    regarding: {listing.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => refetchChat()}
                  title="Refresh Chat"
                  className="text-gray-400 hover:text-white p-1 rounded-md transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChatModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#0c111e]/30">
              {loadingChat ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : !chatData || chatData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2.5">
                  <MessageSquare className="w-10 h-10 text-gray-600" />
                  <p className="text-sm text-gray-400 font-semibold">Start the conversation</p>
                  <p className="text-xs text-gray-500 max-w-[250px]">
                    Send a message to ask about the account details, trade terms, or transfer details.
                  </p>
                </div>
              ) : (
                chatData.map((msg) => {
                  const isOwn = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                          isOwn
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-slate-800 text-gray-200 rounded-bl-none border border-gray-700/50"
                        }`}
                      >
                        <p className="break-words leading-relaxed">{msg.content}</p>
                        <span
                          className={`text-[9px] block mt-1.5 ${
                            isOwn ? "text-blue-200" : "text-gray-500"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="bg-[#0b0f19] border-t border-gray-800 p-4 flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                disabled={sendMessageMutation.isPending}
                className="flex-grow bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 text-sm text-white px-4 py-2.5 rounded-xl disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sendMessageMutation.isPending || !chatMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/40 text-white p-2.5 rounded-xl transition-colors shrink-0"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetails;
