import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../components/Toast.js";
import type { Listing, User } from "../types/index.js";
import {
  ShieldCheck,
  Users,
  CircleAlert,
  Loader2,
  Trash2,
  Calendar,
  Image as ImageIcon,
  Check,
  X as CloseIcon
} from "lucide-react";

interface AdminUser extends User {
  listingsCount: number;
}

const AdminDashboard = () => {
  const { user: currentAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"pending" | "users">("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionText, setRejectionText] = useState("");

  // Fetch pending listings
  const { data: pendingData, isLoading: loadingPending } = useQuery({
    queryKey: ["adminPendingListings"],
    queryFn: async () => {
      const res = await api.get("/admin/listings/pending");
      return res.data?.data?.listings as Listing[];
    },
    enabled: activeTab === "pending",
  });

  // Fetch all users
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ["adminAllUsers"],
    queryFn: async () => {
      const res = await api.get("/admin/users");
      return res.data?.data?.users as AdminUser[];
    },
    enabled: activeTab === "users",
  });

  // Query stats (we can calculate from lists or run a fetch)
  // Let's calculate them locally based on users and listings, or fetch. We'll do a quick calculate to show premium dynamic stats cards.
  const pendingCount = pendingData?.length || 0;
  const totalUsersCount = usersData?.length || 0;

  // Approve listing mutation
  const approveMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const res = await api.patch(`/admin/listings/${listingId}/approve`);
      return res.data;
    },
    onSuccess: () => {
      toast("Listing approved and is now public!", "success");
      queryClient.invalidateQueries({ queryKey: ["adminPendingListings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
    onError: (err: any) => {
      toast(err.response?.data?.message || "Approve failed", "error");
    },
  });

  // Reject listing mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.patch(`/admin/listings/${id}/reject`, {
        rejectionReason: reason,
      });
      return res.data;
    },
    onSuccess: () => {
      toast("Listing rejected successfully", "success");
      setRejectingId(null);
      setRejectionText("");
      queryClient.invalidateQueries({ queryKey: ["adminPendingListings"] });
    },
    onError: (err: any) => {
      toast(err.response?.data?.message || "Rejection failed", "error");
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast("User deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["adminAllUsers"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
    onError: (err: any) => {
      toast(err.response?.data?.message || "Failed to delete user", "error");
    },
  });

  // Toggle user role mutation
  const toggleRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: "USER" | "ADMIN" }) => {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      return res.data;
    },
    onSuccess: (data) => {
      const updatedUser = data?.data?.user;
      toast(`User role updated to ${updatedUser?.role || "new role"} successfully!`, "success");
      queryClient.invalidateQueries({ queryKey: ["adminAllUsers"] });
    },
    onError: (err: any) => {
      toast(err.response?.data?.message || "Failed to update user role", "error");
    },
  });

  const handleToggleRole = (userId: string, currentRole: "USER" | "ADMIN") => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    const confirmMessage = currentRole === "ADMIN" 
      ? "Are you sure you want to demote this admin to a standard USER? They will lose access to the Admin Panel immediately."
      : "Are you sure you want to promote this user to an ADMIN? They will gain access to verify listings and moderate users.";
    
    if (window.confirm(confirmMessage)) {
      toggleRoleMutation.mutate({ userId, newRole });
    }
  };

  const handleApprove = (listingId: string) => {
    approveMutation.mutate(listingId);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId || !rejectionText.trim()) return;
    rejectMutation.mutate({ id: rejectingId, reason: rejectionText.trim() });
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this user? ALL of their listings will be cascade-deleted!")) {
      deleteUserMutation.mutate(userId);
    }
  };

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <span>Admin Panel</span>
          <span className="text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            Moderator Mode
          </span>
        </h1>
        <p className="text-sm text-gray-400">Review pending account submissions, verify details, and manage user accounts</p>
      </div>

      {/* Admin stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#111827]/40 border border-gray-800 p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Pending Reviews</span>
            <span className="text-3xl font-black text-white block mt-1">{loadingPending ? "..." : pendingCount}</span>
          </div>
          <CircleAlert className="w-10 h-10 text-amber-500/40" />
        </div>

        <div className="bg-[#111827]/40 border border-gray-800 p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-blue-500">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Admin Operator</span>
            <span className="text-sm font-semibold text-white block mt-2.5 truncate max-w-[150px]">
              {currentAdmin?.name}
            </span>
          </div>
          <ShieldCheck className="w-10 h-10 text-blue-500/40" />
        </div>

        <div className="bg-[#111827]/40 border border-gray-800 p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-indigo-500">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Total Managed Users</span>
            <span className="text-3xl font-black text-white block mt-1">{loadingUsers ? "..." : totalUsersCount}</span>
          </div>
          <Users className="w-10 h-10 text-indigo-500/40" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-850 mb-8">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "pending"
              ? "border-blue-500 text-white"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Pending Listings ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "users"
              ? "border-blue-500 text-white"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          User Management
        </button>
      </div>

      {/* ================= TAB 1: PENDING LISTINGS ================= */}
      {activeTab === "pending" && (
        <section>
          {loadingPending ? (
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-slate-900/40 border border-gray-850 h-56 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : !pendingData || pendingData.length === 0 ? (
            <div className="text-center py-16 border border-gray-850 bg-slate-900/10 rounded-2xl">
              <ShieldCheck className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">All caught up! No pending listings to review.</p>
              <p className="text-xs text-gray-500 mt-1">New listings submitted by sellers will show up here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingData.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-slate-900/40 border border-gray-800 rounded-2xl p-6 flex flex-col lg:flex-row gap-6 backdrop-blur-md"
                >
                  {/* Left Column: Image previews */}
                  <div className="w-full lg:w-72 shrink-0">
                    <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-gray-800 relative mb-3">
                      {listing.images[0] ? (
                        <img src={listing.images[0].imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <ImageIcon className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    {/* Small thumbnails preview */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {listing.images.map((img) => (
                        <a
                          key={img.id}
                          href={img.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-14 aspect-video bg-slate-950 rounded-lg overflow-hidden border border-gray-800 shrink-0 hover:border-blue-500"
                        >
                          <img src={img.imageUrl} alt="preview" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Middle Column: Details */}
                  <div className="flex-grow space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] uppercase font-extrabold tracking-widest text-blue-400 bg-blue-950/40 border border-blue-900/30 px-2 py-0.5 rounded">
                          {listing.platform}
                        </span>
                        <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-400 bg-slate-800/40 border border-slate-700/30 px-2 py-0.5 rounded">
                          Level {listing.accountLevel}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white leading-tight">{listing.title}</h3>
                      <p className="text-xs text-gray-500">Seller: {listing.seller.name} ({listing.seller.email})</p>
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed whitespace-pre-line">
                      {listing.description}
                    </p>

                    <div className="text-xs font-bold text-white flex items-center gap-4 bg-[#070b13]/50 p-3 rounded-xl w-fit">
                      <span>Price: ${listing.price.toLocaleString()}</span>
                      <span className="text-gray-700">|</span>
                      <span>Country: {listing.country}</span>
                    </div>
                  </div>

                  {/* Right Column: Review Decisions */}
                  <div className="lg:w-44 shrink-0 flex flex-row lg:flex-col justify-end lg:justify-center gap-3 border-t lg:border-t-0 lg:border-l border-gray-800/50 pt-4 lg:pt-0 lg:pl-6">
                    <button
                      onClick={() => handleApprove(listing.id)}
                      disabled={approveMutation.isPending}
                      className="flex-grow lg:w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    
                    <button
                      onClick={() => setRejectingId(listing.id)}
                      className="flex-grow lg:w-full flex items-center justify-center gap-2 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold transition-colors"
                    >
                      <CloseIcon className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ================= TAB 2: USER MANAGEMENT ================= */}
      {activeTab === "users" && (
        <section>
          {loadingUsers ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-900/40 border border-gray-850 h-16 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : !usersData || usersData.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No users found.</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-850 bg-[#111827]/25 backdrop-blur-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-850 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <th className="py-4 px-6">User details</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Listings</th>
                    <th className="py-4 px-6">Joined Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850 text-sm text-gray-300">
                  {usersData.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {usr.avatar ? (
                            <img src={usr.avatar} alt={usr.name} className="w-9 h-9 rounded-full object-cover border border-gray-750" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-blue-600/15 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                              {usr.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-white block">{usr.name}</span>
                            <span className="text-xs text-gray-500 block leading-none mt-0.5">{usr.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md ${
                          usr.role === "ADMIN" ? "bg-rose-950/40 border border-rose-900/30 text-rose-400" : "bg-slate-800 border border-slate-700 text-gray-300"
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-white">{usr.listingsCount}</td>
                      <td className="py-4 px-6 text-gray-500 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(usr.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {usr.id === currentAdmin?.id ? (
                          <span className="text-xs text-gray-500 italic pr-2">Current Admin</span>
                        ) : (
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={() => handleToggleRole(usr.id, usr.role)}
                              disabled={toggleRoleMutation.isPending}
                              className={`p-2 rounded-lg border transition-all ${
                                usr.role === "ADMIN"
                                  ? "bg-amber-950/20 text-amber-400 hover:bg-amber-900/30 border-amber-500/20"
                                  : "bg-blue-950/20 text-blue-400 hover:bg-blue-900/30 border-blue-500/20"
                              }`}
                              title={usr.role === "ADMIN" ? "Demote to standard User" : "Promote to Admin"}
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(usr.id)}
                              disabled={deleteUserMutation.isPending}
                              className="p-2 rounded-lg bg-rose-950/20 text-rose-400 hover:bg-rose-900/30 border border-rose-500/20 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ================= INLINE REJECTION REASON DIALOG MODAL ================= */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Provide Rejection Reason</h3>
            <p className="text-xs text-gray-400">
              Please enter the reason for rejecting this listing. The seller will see this on their dashboard and can edit and resubmit their listing.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                placeholder="e.g. Screenshot must show proof of level. Level mismatch. Blur image."
                value={rejectionText}
                onChange={(e) => setRejectionText(e.target.value)}
                required
                rows={4}
                className="w-full bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 rounded-xl text-sm text-white p-3 placeholder-gray-600 focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingId(null);
                    setRejectionText("");
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectMutation.isPending || !rejectionText.trim()}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-500/10"
                >
                  {rejectMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  <span>Reject Listing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
