import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { useListingStore } from "../stores/useListingStore";
import { useChatStore } from "../stores/useChatStore";
import { useToast } from "../components/Toast.js";
import ListingCard from "../components/ListingCard.js";
import ChatModal from "../components/ChatModal.js";
import {
  ShieldCheck,
  MapPin,
  Layers,
  MessageSquare,
  ChevronLeft
} from "lucide-react";

const ListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.authUser);
  const isAuthenticated = useAuthStore((state) => state.isLoggedIn);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Listing store hooks
  const listing = useListingStore((state) => state.currentListing);
  const relatedListings = useListingStore((state) => state.relatedListings);
  const isLoading = useListingStore((state) => state.isLoading);
  const error = useListingStore((state) => state.error);
  const fetchListingDetails = useListingStore((state) => state.fetchListingDetails);

  // Chat store hooks
  const chatHistory = useChatStore((state) => state.chatHistory);
  const loadingChat = useChatStore((state) => state.loadingChat);
  const fetchChatHistory = useChatStore((state) => state.fetchChatHistory);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const sendingMessage = useChatStore((state) => state.sendingMessage);

  // Fetch listing details and related listings
  useEffect(() => {
    if (id) {
      fetchListingDetails(id);
    }
  }, [id, fetchListingDetails]);

  // Reset active image when listing changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [id]);

  // Fetch chat history with seller
  const refetchChat = () => {
    if (listing?.sellerId && id && isAuthenticated) {
      fetchChatHistory(listing.sellerId, id);
    }
  };

  useEffect(() => {
    if (chatModalOpen && listing?.sellerId && id) {
      refetchChat();
    } else if (!chatModalOpen) {
      useChatStore.getState().clearActiveChat();
    }
  }, [chatModalOpen, listing?.sellerId, id]);

  useEffect(() => {
    return () => {
      useChatStore.getState().clearActiveChat();
    };
  }, []);

  // Auto-scroll to bottom of chat when new messages load
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, chatModalOpen]);

  const handleContactClick = () => {
    if (!isAuthenticated) {
      toast("Please sign in to contact the seller", "info");
      navigate("/login", { state: { from: location } });
      return;
    }
    setChatModalOpen(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !listing?.sellerId || !id || sendingMessage) return;
    try {
      await sendMessage(chatMessage.trim(), listing.sellerId, id);
      setChatMessage("");
    } catch (err: any) {
      toast(err.response?.data?.message || "Failed to send message", "error");
    }
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
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-gray-800 bg-slate-950 relative group shadow-2xl">
            {listing.images.length > 0 ? (
              <img
                src={listing.images[activeImageIndex]?.imageUrl}
                alt={listing.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                <span>No screenshots uploaded</span>
              </div>
            )}

            {/* Badge for verified */}
            {listing.status === "VERIFIED" && (
              <div className="absolute top-4 left-4 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-blue-500/25">
                <ShieldCheck className="w-3.5 h-3.5 fill-white/10" />
                <span>Verified Owner</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {listing.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {listing.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(i)}
                  className={`aspect-video w-20 rounded-xl overflow-hidden border bg-slate-950 transition-all ${
                    activeImageIndex === i ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= RIGHT COLUMN: LISTING INFO ================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/40 border border-gray-800/80 p-6 rounded-2xl backdrop-blur-sm shadow-xl space-y-5">
            {/* Title / Description */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                <span>{listing.category}</span>
                <span>•</span>
                <span>{listing.platform}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">{listing.title}</h1>
              <p className="text-xs text-gray-500 mt-1">Listed on {new Date(listing.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Price */}
            <div className="border-y border-gray-850 py-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Asking Price</span>
                <div className="text-3xl font-black text-white mt-0.5">₹{listing.price}</div>
              </div>
              
              {/* Regional Server */}
              <div className="text-right">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Region / Server</span>
                <div className="flex items-center gap-1 justify-end text-sm text-gray-200 mt-1.5 font-bold">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>{listing.country}</span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#070b13]/60 border border-gray-850 rounded-xl space-y-1">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Level / Follower</span>
                <div className="text-sm font-bold text-gray-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>{listing.accountLevel}</span>
                </div>
              </div>
              
              <div className="p-3 bg-[#070b13]/60 border border-gray-850 rounded-xl space-y-1">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Verification</span>
                <div className="text-sm font-bold text-gray-300 flex items-center gap-1.5">
                  <ShieldCheck className={`w-4 h-4 ${listing.status === "VERIFIED" ? "text-emerald-500" : "text-amber-500"}`} />
                  <span>{listing.status}</span>
                </div>
              </div>
            </div>

            {/* Seller profile snippet */}
            <div className="p-4 bg-[#070b13]/40 border border-gray-850 rounded-xl flex items-center gap-3">
              {listing.seller.avatar ? (
                <img
                  src={listing.seller.avatar}
                  alt={listing.seller.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold uppercase">
                  {listing.seller.name.charAt(0)}
                </div>
              )}
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block leading-none">Seller</span>
                <span className="text-sm font-semibold text-gray-200 block mt-1">{listing.seller.name}</span>
              </div>
            </div>

            {/* Action CTAs */}
            {isSeller ? (
              <Link
                to={`/listings/${listing.id}/edit`}
                className="w-full flex items-center justify-center py-3 bg-gray-850 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold border border-gray-700 transition-colors"
              >
                Edit Listing details
              </Link>
            ) : (
              <button
                onClick={handleContactClick}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25"
              >
                <MessageSquare className="w-4 h-4 fill-white/10" />
                <span>Contact Seller Directly</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= DESCRIPTION TAB ================= */}
      <section className="mb-16">
        <h2 className="text-lg font-bold text-white mb-4 border-b border-gray-850 pb-2">Listing Description</h2>
        <div className="bg-slate-900/10 border border-gray-850/60 p-6 rounded-2xl text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {listing.description}
        </div>
      </section>

      {/* ================= RELATED LISTINGS ================= */}
      {relatedListings && relatedListings.length > 0 && (
        <section className="border-t border-gray-900 pt-12">
          <h2 className="text-xl font-bold text-white mb-8">Related Verified Listings</h2>
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
      <ChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        listing={listing}
        chatHistory={chatHistory}
        loadingChat={loadingChat}
        sendingMessage={sendingMessage}
        chatMessage={chatMessage}
        setChatMessage={setChatMessage}
        handleSendMessage={handleSendMessage}
        refetchChat={refetchChat}
        chatEndRef={chatEndRef}
        currentUser={user}
      />
    </div>
  );
};

export default ListingDetails;
