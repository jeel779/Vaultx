import { Link } from "react-router-dom";
import type { Listing } from "../types/index.js";
import { ShieldCheck, MapPin, Layers } from "lucide-react";

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const mainImage = listing.images[0]?.imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640";

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group relative bg-[#111827]/70 border border-gray-800 hover:border-blue-500/50 rounded-2xl overflow-hidden backdrop-blur-md shadow-lg transition-all duration-300 flex flex-col h-full"
    >
      {/* Listing Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950 shrink-0">
        <img
          src={mainImage}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Verification Status Overlay Badge */}
        {listing.status === "VERIFIED" && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg border border-blue-400/30">
            <ShieldCheck className="w-3.5 h-3.5 fill-white/10" />
            <span>Verified</span>
          </div>
        )}

        {listing.status === "SOLD" && (
          <div className="absolute inset-0 bg-[#070b13]/85 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="border border-rose-500/50 text-rose-400 bg-rose-950/20 text-sm font-bold uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-2xl">
              Sold Out
            </div>
          </div>
        )}

        {/* Price tag */}
        <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-sm border border-gray-800 text-white font-bold text-base px-3 py-1 rounded-xl shadow-md">
          ₹{listing.price.toLocaleString()}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-950/40 border border-blue-900/30 px-2 py-0.5 rounded-md">
            {listing.platform}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-800/40 border border-slate-700/30 px-2 py-0.5 rounded-md">
            {listing.category}
          </span>
        </div>

        <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-2">
          {listing.title}
        </h3>

        <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed flex-grow">
          {listing.description}
        </p>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-800/50 pt-3 mt-auto">
          <div className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-500/70" />
            <span>Lv. {listing.accountLevel}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-600" />
            <span>{listing.country}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
