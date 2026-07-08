import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useListingStore } from "../stores/useListingStore";
import ListingCard from "./ListingCard";

const FeaturedListings: React.FC = () => {
  const latestListings = useListingStore((state) => state.latestListings);
  const fetchLatestListings = useListingStore((state) => state.fetchLatestListings);
  const isLoading = useListingStore((state) => state.isLoading);

  useEffect(() => {
    fetchLatestListings();
  }, [fetchLatestListings]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-900/40 border border-gray-855 rounded-2xl overflow-hidden animate-pulse flex flex-col h-80">
            <div className="w-full bg-slate-800 aspect-video"></div>
            <div className="p-5 flex-grow space-y-3.5">
              <div className="h-3.5 bg-slate-800 rounded w-1/3"></div>
              <div className="h-5 bg-slate-800 rounded w-5/6"></div>
              <div className="h-3.5 bg-slate-800 rounded w-full"></div>
              <div className="h-3 bg-slate-800 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!latestListings || latestListings.length === 0) {
    return (
      <div className="text-center py-16 border border-gray-800 bg-slate-900/20 rounded-2xl max-w-5xl mx-auto">
        <p className="text-gray-400 font-medium">No verified listings available right now.</p>
        <Link to="/listings/create" className="text-sm text-blue-400 font-semibold hover:underline mt-2 inline-block">
          Be the first to create one!
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {latestListings.slice(0, 3).map((listing: any) => (
        <div key={listing.id} className="transition-all duration-300 hover:-translate-y-1">
          <ListingCard listing={listing} />
        </div>
      ))}
    </div>
  );
};

export default FeaturedListings;
