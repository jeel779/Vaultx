import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api.js";
import ListingCard from "../components/ListingCard.js";
import type { Listing } from "../types/index.js";
import { Filter, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Read URL search params
  const category = searchParams.get("category") || "";
  const platform = searchParams.get("platform") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "newest";
  const page = searchParams.get("page") || "1";

  // Local filter states
  const [localSearch, setLocalSearch] = useState(search);
  const [localCategory, setLocalCategory] = useState(category);
  const [localPlatform, setLocalPlatform] = useState(platform);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localSortBy, setLocalSortBy] = useState(sortBy);

  // Keep local search matching URL param changes (e.g. from hero search)
  useEffect(() => {
    setLocalSearch(search);
    setLocalCategory(category);
    setLocalPlatform(platform);
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
    setLocalSortBy(sortBy);
  }, [category, platform, minPrice, maxPrice, search, sortBy]);

  // Fetch listings from API
  const { data, isLoading } = useQuery({
    queryKey: ["listings", category, platform, minPrice, maxPrice, search, sortBy, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (platform) params.append("platform", platform);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (search) params.append("search", search);
      params.append("sortBy", sortBy);
      params.append("page", page);
      params.append("limit", "8"); // 8 per page
      
      const res = await api.get(`/listings?${params.toString()}`);
      return res.data?.data;
    },
  });

  const listings = data?.listings as Listing[] | undefined;
  const pagination = data?.pagination;

  const applyFilters = () => {
    const newParams: any = { page: "1" };
    if (localSearch) newParams.search = localSearch;
    if (localCategory) newParams.category = localCategory;
    if (localPlatform) newParams.platform = localPlatform;
    if (localMinPrice) newParams.minPrice = localMinPrice;
    if (localMaxPrice) newParams.maxPrice = localMaxPrice;
    newParams.sortBy = localSortBy;

    setSearchParams(newParams);
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setLocalSearch("");
    setLocalCategory("");
    setLocalPlatform("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setLocalSortBy("newest");
    setSearchParams({ page: "1", sortBy: "newest" });
    setShowMobileFilters(false);
  };

  const handlePageChange = (newPageNum: number) => {
    const currentParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      currentParams[key] = value;
    });
    setSearchParams({ ...currentParams, page: newPageNum.toString() });
  };

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Explore Accounts</h1>
          <p className="text-sm text-gray-400">Discover hand-verified premium gaming and social media accounts</p>
        </div>

        {/* Mobile Filter Trigger */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className="md:hidden w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 border border-gray-800 hover:bg-slate-800 text-white font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-blue-500" />
          <span>Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* ================= DESKTOP SIDEBAR FILTERS ================= */}
        <aside className="hidden md:block col-span-1 space-y-6 shrink-0 bg-slate-900/40 border border-gray-800/80 p-6 rounded-2xl h-fit sticky top-24">
          <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-500" />
              <span>Filters</span>
            </h2>
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Search</label>
            <input
              type="text"
              placeholder="Search title, details..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Category</label>
            <select
              value={localCategory}
              onChange={(e) => setLocalCategory(e.target.value)}
              className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Gaming">Gaming</option>
              <option value="Social Media">Social Media</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Platform Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Platform</label>
            <input
              type="text"
              placeholder="e.g. PUBG, Instagram"
              value={localPlatform}
              onChange={(e) => setLocalPlatform(e.target.value)}
              className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Price Range</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-gray-600">-</span>
              <input
                type="number"
                placeholder="Max"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Sort By</label>
            <select
              value={localSortBy}
              onChange={(e) => setLocalSortBy(e.target.value)}
              className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>

          {/* Apply Button */}
          <button
            onClick={applyFilters}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-500/10"
          >
            Apply Filters
          </button>
        </aside>

        {/* ================= MAIN PRODUCTS LISTING GRID ================= */}
        <section className="col-span-1 md:col-span-3 flex flex-col justify-between min-h-[500px]">
          {isLoading ? (
            /* Loading State Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-900/40 border border-gray-850 rounded-2xl overflow-hidden animate-pulse flex flex-col h-80">
                  <div className="w-full bg-slate-800 aspect-video"></div>
                  <div className="p-5 flex-grow space-y-3">
                    <div className="h-3 bg-slate-800 rounded w-1/4"></div>
                    <div className="h-5 bg-slate-800 rounded w-5/6"></div>
                    <div className="h-3.5 bg-slate-800 rounded w-full"></div>
                    <div className="h-3 bg-slate-800 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : !listings || listings.length === 0 ? (
            /* Empty State */
            <div className="flex-grow flex flex-col items-center justify-center text-center p-12 border border-gray-800 bg-slate-900/15 rounded-2xl">
              <p className="text-gray-400 font-medium text-lg mb-2">No matching accounts found</p>
              <p className="text-sm text-gray-500 mb-6 max-w-sm">Try widening your price range, typing a different platform name, or clearing filters.</p>
              <button
                onClick={clearFilters}
                className="bg-gray-850 hover:bg-gray-800 border border-gray-850 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            /* Listings Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {listings.map((listing) => (
                <div key={listing.id} className="h-full">
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          )}

          {/* ================= PAGINATION ================= */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-900 pt-6 mt-auto">
              <span className="text-xs text-gray-500">
                Showing Page <span className="font-semibold text-gray-300">{pagination.page}</span> of{" "}
                <span className="font-semibold text-gray-300">{pagination.totalPages}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="flex items-center justify-center p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-gray-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="flex items-center justify-center p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-gray-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ================= MOBILE SLIDE-OUT FILTER DRAWER ================= */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm md:hidden animate-fade-in">
          <div className="w-full max-w-xs bg-slate-950 border-l border-gray-800 p-6 flex flex-col justify-between h-full">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-900 mb-6">
                <h2 className="font-bold text-white text-lg flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-500" />
                  <span>Filters</span>
                </h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form elements */}
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Search</label>
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
                  <select
                    value={localCategory}
                    onChange={(e) => setLocalCategory(e.target.value)}
                    className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform</label>
                  <input
                    type="text"
                    placeholder="e.g. PUBG, Valorant"
                    value={localPlatform}
                    onChange={(e) => setLocalPlatform(e.target.value)}
                    className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={localMinPrice}
                      onChange={(e) => setLocalMinPrice(e.target.value)}
                      className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <span className="text-gray-600">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={localMaxPrice}
                      onChange={(e) => setLocalMaxPrice(e.target.value)}
                      className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sort By</label>
                  <select
                    value={localSortBy}
                    onChange={(e) => setLocalSortBy(e.target.value)}
                    className="w-full bg-[#070b13] border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-8">
              <button
                onClick={applyFilters}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-xl text-sm font-semibold transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
