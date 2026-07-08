import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useListingStore } from "../stores/useListingStore";
import ListingCard from "../components/ListingCard.js";
import ExploreFilters from "../components/ExploreFilters.js";
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

  const listings = useListingStore((state) => state.listings);
  const pagination = useListingStore((state) => state.pagination);
  const isLoading = useListingStore((state) => state.isLoading);
  const fetchListings = useListingStore((state) => state.fetchListings);

  // Fetch listings from API
  useEffect(() => {
    const params: Record<string, string> = {
      sortBy,
      page,
      limit: "8",
    };
    if (category) params.category = category;
    if (platform) params.platform = platform;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (search) params.search = search;

    fetchListings(params);
  }, [category, platform, minPrice, maxPrice, search, sortBy, page, fetchListings]);

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
          </div>
          <ExploreFilters
            localSearch={localSearch}
            setLocalSearch={setLocalSearch}
            localCategory={localCategory}
            setLocalCategory={setLocalCategory}
            localPlatform={localPlatform}
            setLocalPlatform={setLocalPlatform}
            localMinPrice={localMinPrice}
            setLocalMinPrice={setLocalMinPrice}
            localMaxPrice={localMaxPrice}
            setLocalMaxPrice={setLocalMaxPrice}
            localSortBy={localSortBy}
            setLocalSortBy={setLocalSortBy}
            applyFilters={applyFilters}
            clearFilters={clearFilters}
          />
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
          <div className="w-full max-w-xs bg-slate-950 border-l border-gray-800 p-6 flex flex-col h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-900 mb-6 shrink-0">
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

            <ExploreFilters
              localSearch={localSearch}
              setLocalSearch={setLocalSearch}
              localCategory={localCategory}
              setLocalCategory={setLocalCategory}
              localPlatform={localPlatform}
              setLocalPlatform={setLocalPlatform}
              localMinPrice={localMinPrice}
              setLocalMinPrice={setLocalMinPrice}
              localMaxPrice={localMaxPrice}
              setLocalMaxPrice={setLocalMaxPrice}
              localSortBy={localSortBy}
              setLocalSortBy={setLocalSortBy}
              applyFilters={applyFilters}
              clearFilters={clearFilters}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
