import React from "react";

interface ExploreFiltersProps {
  localSearch: string;
  setLocalSearch: (val: string) => void;
  localCategory: string;
  setLocalCategory: (val: string) => void;
  localPlatform: string;
  setLocalPlatform: (val: string) => void;
  localMinPrice: string;
  setLocalMinPrice: (val: string) => void;
  localMaxPrice: string;
  setLocalMaxPrice: (val: string) => void;
  localSortBy: string;
  setLocalSortBy: (val: string) => void;
  applyFilters: () => void;
  clearFilters: () => void;
}

const ExploreFilters: React.FC<ExploreFiltersProps> = ({
  localSearch,
  setLocalSearch,
  localCategory,
  setLocalCategory,
  localPlatform,
  setLocalPlatform,
  localMinPrice,
  setLocalMinPrice,
  localMaxPrice,
  setLocalMaxPrice,
  localSortBy,
  setLocalSortBy,
  applyFilters,
  clearFilters,
}) => {
  return (
    <div className="space-y-6">
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
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Price Range (₹ INR)</label>
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

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={applyFilters}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-500/10"
        >
          Apply Filters
        </button>
        <button
          onClick={clearFilters}
          className="w-full py-2 bg-slate-900 border border-gray-800 hover:bg-slate-800 text-gray-300 rounded-xl text-xs font-semibold transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ExploreFilters;
