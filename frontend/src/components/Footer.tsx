import { Link } from "react-router-dom";
import { Shield, ShieldAlert, Globe, Code } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#070b13] border-t border-gray-900 text-gray-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wider text-white mb-4">
              <Shield className="w-6 h-6 text-blue-500 fill-blue-500/10" />
              <span>VAULT<span className="text-blue-500">X</span></span>
            </Link>
            <p className="text-sm max-w-sm mb-4 leading-relaxed">
              VaultX is a secure marketplace for digital accounts and assets. Every listing is manually reviewed and verified by our admin team before being listed publicly.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Code className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explore?category=Gaming" className="hover:text-white transition-colors">
                  Gaming Accounts
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Social Media" className="hover:text-white transition-colors">
                  Social Media Handles
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Other" className="hover:text-white transition-colors">
                  Digital Assets
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Explore Listings
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Register Seller Account
                </Link>
              </li>
              <li className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2 py-1 rounded-md w-fit">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>100% Manually Verified</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-900 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} VaultX Marketplace. All rights reserved.</p>
          <p className="mt-4 md:mt-0">
            Build with React, Express, Prisma & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
