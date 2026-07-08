import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useAuthStore } from "../stores/useAuthStore";
import { useToast } from "../components/Toast.js";
import { Shield, KeyRound, Mail, Loader2, ShieldAlert } from "lucide-react";

// Local schema in case import path fails or to keep frontend decoupled
const clientLoginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const Login: React.FC = () => {
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.isLoading);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = clientLoginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    try {
      await login(email, password);
      toast("Successfully logged in!", "success");
      const user = useAuthStore.getState().authUser;
      if (user?.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast(error.message || "Invalid credentials", "error");
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-slate-900/60 border border-gray-800 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 border transition-all duration-300 ${
            showAdminLogin ? "bg-rose-600/10 border-rose-500/20" : "bg-blue-600/10 border-blue-500/20"
          }`}>
            {showAdminLogin ? (
              <ShieldAlert className="w-6 h-6 text-rose-500 fill-rose-500/10 transition-transform duration-300 animate-pulse" />
            ) : (
              <Shield className="w-6 h-6 text-blue-500 fill-blue-500/10 transition-transform duration-300" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide transition-colors duration-300">
            {showAdminLogin ? "Admin Portal" : "Welcome Back"}
          </h2>
          <p className="text-sm text-gray-400 mt-1 transition-colors duration-300">
            {showAdminLogin ? "Sign in to access administrator features" : "Sign in to manage your digital listings"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-[#070b13] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#070b13] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Admin Login Toggle */}
          <div className="pt-1 text-right">
            <button
              type="button"
              onClick={() => setShowAdminLogin(!showAdminLogin)}
              className="text-xs text-gray-500 hover:text-blue-400 font-medium transition-colors"
            >
              {showAdminLogin ? "Hide Admin Portal" : "Login as Admin?"}
            </button>
          </div>

          {/* Admin Info Alert */}
          {showAdminLogin && (
            <div className="p-4 bg-slate-950/40 border border-gray-800/80 rounded-xl space-y-2 animate-fade-in">
              <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                Admin Portal Mode
              </p>
              <p className="text-[10px] text-gray-500 leading-normal">
                Logging in with this mode active will automatically authenticate you as an administrator and redirect you directly to the Admin moderation panel.
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-lg ${
              showAdminLogin
                ? "bg-rose-600 hover:bg-rose-700 disabled:bg-rose-800/50 shadow-rose-500/20"
                : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 shadow-blue-500/20"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{showAdminLogin ? "Signing In as Admin..." : "Signing In..."}</span>
              </>
            ) : (
              <span>{showAdminLogin ? "Sign In as Admin" : "Sign In"}</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

