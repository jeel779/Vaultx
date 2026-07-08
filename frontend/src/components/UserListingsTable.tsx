import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, CircleDot, BadgeAlert, CheckCircle, Edit2, Trash2 } from "lucide-react";
import type { Listing } from "../types/index.js";

interface UserListingsTableProps {
  loading: boolean;
  listings: Listing[];
  actionInProgress: string | null;
  onMarkAsSold: (id: string) => void;
  onDelete: (id: string) => void;
}

const UserListingsTable: React.FC<UserListingsTableProps> = ({
  loading,
  listings,
  actionInProgress,
  onMarkAsSold,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-900/40 border border-gray-855 h-20 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-16 border border-gray-800 bg-slate-900/10 rounded-2xl">
        <p className="text-gray-400 font-medium mb-3">You haven't listed any accounts yet.</p>
        <Link
          to="/listings/create"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
        >
          List Your First Account
        </Link>
      </div>
    );
  }

  return (
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
          {listings.map((listing) => (
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
              <td className="py-4 px-6 font-bold text-white">₹{listing.price.toLocaleString()}</td>
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
                      onClick={() => onMarkAsSold(listing.id)}
                      disabled={actionInProgress === listing.id}
                      title="Mark as Sold"
                      className="p-2 rounded-lg bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/30 border border-emerald-500/20 transition-colors disabled:opacity-50"
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
                    onClick={() => onDelete(listing.id)}
                    disabled={actionInProgress === listing.id}
                    title="Delete Listing"
                    className="p-2 rounded-lg bg-rose-950/20 text-rose-400 hover:bg-rose-900/30 border border-rose-500/20 transition-colors disabled:opacity-50"
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
  );
};

export default UserListingsTable;
