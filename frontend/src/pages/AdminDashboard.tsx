import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useToast } from "../components/Toast.js";
import { ShieldCheck, Users, CircleAlert } from "lucide-react";
import { useAdminStore } from "../stores/useAdminStore";
import AdminPendingItem from "../components/AdminPendingItem.js";
import AdminUsersTable from "../components/AdminUsersTable.js";
import RejectionModal from "../components/RejectionModal.js";

const AdminDashboard = () => {
  const currentAdmin = useAuthStore((state) => state.authUser);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"pending" | "users">("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionText, setRejectionText] = useState("");

  const pendingListings = useAdminStore((state) => state.pendingListings);
  const users = useAdminStore((state) => state.users);
  const loadingPending = useAdminStore((state) => state.loadingPending);
  const loadingUsers = useAdminStore((state) => state.loadingUsers);
  const actionId = useAdminStore((state) => state.actionId);

  const fetchPendingListings = useAdminStore((state) => state.fetchPendingListings);
  const fetchAllUsers = useAdminStore((state) => state.fetchAllUsers);
  const approveListing = useAdminStore((state) => state.approveListing);
  const rejectListing = useAdminStore((state) => state.rejectListing);
  const deleteUser = useAdminStore((state) => state.deleteUser);

  useEffect(() => {
    if (activeTab === "pending") {
      fetchPendingListings();
    } else {
      fetchAllUsers();
    }
  }, [activeTab, fetchPendingListings, fetchAllUsers]);

  // Query stats
  const pendingCount = pendingListings.length;
  const totalUsersCount = users.length;

  // Approve listing
  const handleApprove = async (listingId: string) => {
    try {
      await approveListing(listingId);
      toast("Listing approved and is now public!", "success");
    } catch (err: any) {
      toast(err.response?.data?.message || "Approve failed", "error");
    }
  };

  // Reject listing
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId || !rejectionText.trim()) return;
    try {
      await rejectListing(rejectingId, rejectionText.trim());
      toast("Listing rejected successfully", "success");
      setRejectingId(null);
      setRejectionText("");
    } catch (err: any) {
      toast(err.response?.data?.message || "Rejection failed", "error");
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this user account? This will also remove all their listings.")) return;
    try {
      await deleteUser(userId);
      toast("User deleted successfully", "success");
    } catch (err: any) {
      toast(err.response?.data?.message || "Failed to delete user", "error");
    }
  };

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2.5">
          <ShieldCheck className="w-8 h-8 text-blue-500 fill-blue-500/10" />
          <span>Moderation Panel</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Review pending digital accounts verification requests and manage platform users</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-[#111827]/40 border border-gray-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Pending Verification</span>
            <span className="text-3xl font-black text-white block mt-1">{loadingPending ? "..." : pendingCount}</span>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center border border-amber-500/20">
            <CircleAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#111827]/40 border border-gray-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Registered Users</span>
            <span className="text-3xl font-black text-white block mt-1">{loadingUsers && activeTab === "users" ? "..." : totalUsersCount}</span>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center border border-blue-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#111827]/40 border border-gray-800 p-5 rounded-2xl flex flex-col justify-center">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Admin Role</span>
          <span className="text-sm font-semibold text-gray-300 block mt-1 truncate">{currentAdmin?.name} ({currentAdmin?.email})</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-850 mb-8">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "pending"
              ? "border-blue-500 text-white"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <span>Pending Approvals</span>
          {pendingCount > 0 && (
            <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "users"
              ? "border-blue-500 text-white"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Users Management
        </button>
      </div>

      {/* ================= TAB 1: PENDING APPROVALS ================= */}
      {activeTab === "pending" && (
        <section className="space-y-6">
          {loadingPending ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-slate-900/40 border border-gray-855 h-56 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : pendingListings.length === 0 ? (
            <div className="text-center py-16 border border-gray-800 bg-slate-900/10 rounded-2xl">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">All caught up!</p>
              <p className="text-xs text-gray-500 mt-1">There are no pending accounts listings awaiting moderation.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingListings.map((listing) => (
                <AdminPendingItem
                  key={listing.id}
                  listing={listing}
                  actionId={actionId}
                  onApprove={handleApprove}
                  onReject={(id) => setRejectingId(id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ================= TAB 2: USERS MANAGEMENT ================= */}
      {activeTab === "users" && (
        <section>
          <AdminUsersTable
            loading={loadingUsers}
            users={users}
            currentAdminId={currentAdmin?.id}
            actionId={actionId}
            onDeleteUser={handleDeleteUser}
          />
        </section>
      )}

      {/* ================= REJECTION MODAL DIALOG ================= */}
      <RejectionModal
        isOpen={rejectingId !== null}
        onClose={() => {
          setRejectingId(null);
          setRejectionText("");
        }}
        rejectionText={rejectionText}
        setRejectionText={setRejectionText}
        onSubmit={handleRejectSubmit}
        actionInProgress={actionId !== null}
      />
    </div>
  );
};

export default AdminDashboard;
