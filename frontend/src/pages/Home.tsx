import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FeaturedListings from "../components/FeaturedListings.js";
import { Search, Gamepad2, Share2, Wallet, Sparkles, ShieldCheck, CheckCircle2, ShieldAlert } from "lucide-react";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/explore");
    }
  };

  return (
    <div className="flex-col flex min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 text-center border-b border-gray-900 bg-gradient-to-b from-[#0b0f19] to-[#070b13]">
        <div className="absolute top-[-10%] left-[5%] w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[5%] w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Tag */}
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-400 mb-6 tracking-wide animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Secure Digital Accounts Marketplace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Buy & Sell Verified <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
              Digital Accounts
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            VaultX manually verifies ownership of all gaming, social media, and digital asset accounts. Safely buy or sell verified listings directly.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center bg-slate-900 border border-gray-800 focus-within:border-blue-500/60 p-2 rounded-2xl shadow-2xl transition-all duration-300 mb-8">
            <div className="flex items-center pl-3 pr-2 text-gray-500 shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search PUBG, Instagram, Valorant, Clash of Clans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-sm text-white placeholder-gray-500 focus:outline-none py-2"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 shrink-0"
            >
              Search
            </button>
          </form>

          {/* Core Trust Factors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-12 text-xs font-semibold text-gray-400 uppercase tracking-widest">
            <div className="flex items-center justify-center gap-2 border border-gray-800/50 bg-[#0f172a]/30 py-3.5 px-4 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>100% Owner Verified</span>
            </div>
            <div className="flex items-center justify-center gap-2 border border-gray-800/50 bg-[#0f172a]/30 py-3.5 px-4 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No Admin Commission</span>
            </div>
            <div className="flex items-center justify-center gap-2 border border-gray-800/50 bg-[#0f172a]/30 py-3.5 px-4 rounded-xl col-span-2 sm:col-span-1">
              <ShieldAlert className="w-4 h-4 text-cyan-500" />
              <span>Secure Encrypted Chat</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Browse by Category</h2>
          <p className="text-sm text-gray-400">Discover premium accounts tailored to your interest</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Gaming Category */}
          <Link
            to="/explore?category=Gaming"
            className="group p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-[#111827] border border-gray-800 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Gaming Accounts</h3>
            <p className="text-sm text-gray-400 leading-relaxed">PUBG, Valorant, Clash of Clans, Free Fire, and other esports accounts with high levels and rare skins.</p>
          </Link>

          {/* Social Media Category */}
          <Link
            to="/explore?category=Social+Media"
            className="group p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-[#111827] border border-gray-800 hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Social Media</h3>
            <p className="text-sm text-gray-400 leading-relaxed">High engagement Instagram handles, YouTube channels, and active Discord servers to jumpstart your brand.</p>
          </Link>

          {/* Other Category */}
          <Link
            to="/explore?category=Other"
            className="group p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-[#111827] border border-gray-800 hover:border-cyan-500/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Digital Assets</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Software licenses, domain names, SaaS projects, premium memberships, and other verified digital properties.</p>
          </Link>
        </div>
      </section>

      {/* 3. LATEST VERIFIED LISTINGS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-900/60 bg-[#070b13]/40 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Latest Verified Listings</h2>
              <p className="text-sm text-gray-400">Fresh listings verified by admins within the last 24 hours</p>
            </div>
            <Link
              to="/explore"
              className="text-sm font-semibold text-blue-400 hover:text-blue-300 mt-4 sm:mt-0 transition-colors"
            >
              View All Listings →
            </Link>
          </div>

          <FeaturedListings />
        </div>
      </section>

      {/* 4. VERIFICATION HOW IT WORKS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">VaultX Verification Flow</h2>
          <p className="text-sm text-gray-400">How we keep buyers and sellers safe on our platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Arrow connectors for desktop */}
          <div className="hidden md:block absolute top-12 left-1/8 right-1/8 h-0.5 bg-gradient-to-r from-blue-500/20 via-blue-500/40 to-blue-500/20 z-0"></div>

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center text-center p-4">
            <div className="w-14 h-14 bg-slate-950 border border-gray-800 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg mb-4 ring-4 ring-slate-900">
              1
            </div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">List Account</h3>
            <p className="text-xs leading-relaxed text-gray-400">
              Seller fills out account platform, description, price, and uploads 1-5 screenshots proving ownership.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center text-center p-4">
            <div className="w-14 h-14 bg-slate-950 border border-gray-800 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg mb-4 ring-4 ring-slate-900">
              2
            </div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Admin Review</h3>
            <p className="text-xs leading-relaxed text-gray-400">
              Admin reviews the uploaded images to verify the account level, inventory items, and actual ownership.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center text-center p-4">
            <div className="w-14 h-14 bg-slate-950 border border-gray-800 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg mb-4 ring-4 ring-slate-900">
              3
            </div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Public Verification</h3>
            <p className="text-xs leading-relaxed text-gray-400">
              Approved accounts are published to the Explore feed displaying a blue "Verified" shield badge.
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative z-10 flex flex-col items-center text-center p-4">
            <div className="w-14 h-14 bg-slate-950 border border-gray-800 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg mb-4 ring-4 ring-slate-900">
              4
            </div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Secure Chat</h3>
            <p className="text-xs leading-relaxed text-gray-400">
              Buyers chat with the seller directly on the platform to finalize the details safely. No admin fees.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
