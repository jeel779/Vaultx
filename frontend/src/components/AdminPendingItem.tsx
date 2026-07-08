import React from "react";
import { Image as ImageIcon, Calendar, Loader2, Check, X as CloseIcon } from "lucide-react";
import type { Listing } from "../types/index.js";

interface AdminPendingItemProps {
  listing: Listing;
  actionId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const AdminPendingItem: React.FC<AdminPendingItemProps> = ({
  listing,
  actionId,
  onApprove,
  onReject,
}) => {
  return (
    <div className="bg-[#111827]/30 border border-gray-850 p-6 rounded-2xl flex flex-col md:flex-row gap-6 relative overflow-hidden backdrop-blur-sm">
      {/* Image gallery previews */}
      <div className="w-full md:w-64 aspect-video shrink-0 bg-slate-955 rounded-xl border border-gray-800 overflow-hidden relative group">
        {listing.images.length > 0 ? (
          <img src={listing.images[0]?.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}
        {listing.images.length > 1 && (
          <span className="absolute bottom-2 right-2 bg-slate-900/90 text-white text-[9px] font-bold px-2 py-1 rounded border border-gray-800">
            +{listing.images.length - 1} More
          </span>
        )}
      </div>

      {/* Listing Details */}
      <div className="flex-grow space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[9px] uppercase font-extrabold tracking-widest bg-blue-950 text-blue-400 border border-blue-900/30 px-2 py-0.5 rounded">
              {listing.platform}
            </span>
            <span className="text-[9px] uppercase font-extrabold tracking-widest bg-slate-800 text-gray-400 border border-slate-700/30 px-2 py-0.5 rounded">
              {listing.category}
            </span>
            <span className="text-[9px] uppercase font-extrabold tracking-widest bg-rose-955/20 text-rose-400 border border-rose-900/10 px-2 py-0.5 rounded">
              Region: {listing.country}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white leading-snug">{listing.title}</h3>
          <p className="text-xs text-gray-400 line-clamp-2 mt-1.5">{listing.description}</p>
        </div>

        {/* Metadata specs row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 border-t border-gray-850/50">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 block">Level / Follower</span>
            <span className="text-sm font-semibold text-gray-300">{listing.accountLevel}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 block">Price</span>
            <span className="text-sm font-semibold text-emerald-400 font-bold">₹{listing.price}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 block">Seller</span>
            <span className="text-sm font-semibold text-gray-300 truncate block max-w-[120px]" title={listing.seller.name}>
              {listing.seller.name}
            </span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 block">Created</span>
            <span className="text-sm font-semibold text-gray-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Actions buttons */}
      <div className="flex md:flex-col justify-end gap-2.5 md:border-l border-gray-850/60 md:pl-6 shrink-0 md:justify-center">
        <button
          onClick={() => onApprove(listing.id)}
          disabled={actionId !== null}
          className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40"
        >
          {actionId === listing.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>Approve</span>
        </button>
        <button
          onClick={() => onReject(listing.id)}
          disabled={actionId !== null}
          className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40"
        >
          <CloseIcon className="w-4 h-4" />
          <span>Reject</span>
        </button>
      </div>
    </div>
  );
};

export default AdminPendingItem;
