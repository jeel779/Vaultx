import React from "react";

interface Stats {
  TOTAL: number;
  VERIFIED: number;
  PENDING: number;
  REJECTED: number;
  SOLD: number;
}

interface StatsCardsProps {
  loading: boolean;
  stats: Stats | null;
}

const StatsCards: React.FC<StatsCardsProps> = ({ loading, stats }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-slate-900/40 border border-gray-850 h-24 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
      <div className="bg-[#111827]/40 border border-gray-800 p-5 rounded-2xl">
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Total Listings</span>
        <span className="text-3xl font-black text-white block mt-1">{stats.TOTAL}</span>
      </div>
      <div className="bg-[#111827]/40 border border-gray-800 p-5 rounded-2xl border-l-4 border-l-blue-500">
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block text-blue-400">Verified</span>
        <span className="text-3xl font-black text-white block mt-1">{stats.VERIFIED}</span>
      </div>
      <div className="bg-[#111827]/40 border border-gray-800 p-5 rounded-2xl border-l-4 border-l-amber-500">
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block text-amber-400">Pending</span>
        <span className="text-3xl font-black text-white block mt-1">{stats.PENDING}</span>
      </div>
      <div className="bg-[#111827]/40 border border-gray-800 p-5 rounded-2xl border-l-4 border-l-rose-500">
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block text-rose-400">Rejected</span>
        <span className="text-3xl font-black text-white block mt-1">{stats.REJECTED}</span>
      </div>
      <div className="bg-[#111827]/40 border border-gray-800 p-5 rounded-2xl border-l-4 border-l-emerald-500">
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block text-emerald-400">Sold</span>
        <span className="text-3xl font-black text-white block mt-1">{stats.SOLD}</span>
      </div>
    </div>
  );
};

export default StatsCards;
