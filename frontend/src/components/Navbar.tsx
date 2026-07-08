import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { Shield, Menu, X, LogOut, LayoutDashboard, PlusCircle, User as UserIcon, ShieldAlert } from "lucide-react";

const Navbar = () => {
  const user = useAuthStore((state) => state.authUser);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isLoggedIn);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-[#0b0f19]/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wider text-white">
              <Shield className="w-8 h-8 text-blue-500 fill-blue-500/10" />
              <span>VAULT<span className="text-blue-500">X</span></span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/explore"
              className={`text-sm font-medium transition-colors ${
                isActive("/explore") ? "text-blue-500" : "text-gray-300 hover:text-white"
              }`}
            >
              Explore
            </Link>
            
            {isAuthenticated && user && (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/dashboard") ? "text-blue-500" : "text-gray-300 hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/listings/create"
                  className="flex items-center gap-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-200"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Sell Account</span>
                </Link>

                {user.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-sm font-medium border border-rose-500/50 hover:bg-rose-950/20 text-rose-400 px-4 py-2 rounded-xl transition-all duration-200"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-800 transition-colors focus:outline-none"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold border border-blue-500">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-200 pr-1">{user.name}</span>
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-gray-800 rounded-xl shadow-2xl py-1 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>My Listings</span>
                    </Link>
                    <hr className="border-gray-800 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-950/20 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-all duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c1220] border-b border-gray-800 py-3 px-4 animate-fade-in">
          <div className="flex flex-col gap-3">
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-xl text-base font-medium ${
                isActive("/explore") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-900"
              }`}
            >
              Explore
            </Link>

            {isAuthenticated && user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-base font-medium ${
                    isActive("/dashboard") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-900"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-base font-medium ${
                    isActive("/profile") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-900"
                  }`}
                >
                  Edit Profile
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-base font-medium bg-rose-950/20 text-rose-400 border border-rose-500/30"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/listings/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-base font-medium bg-blue-600 text-white"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Sell Account</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-base font-medium bg-gray-900 text-rose-400 border border-gray-800"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-800">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center text-gray-300 border border-gray-800 hover:bg-gray-900 py-2 rounded-xl text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center bg-blue-600 text-white py-2 rounded-xl text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
