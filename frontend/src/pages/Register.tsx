import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuthStore } from "../stores/useAuthStore";
import { useToast } from "../components/Toast.js";
import { Shield, KeyRound, Mail, User as UserIcon, Loader2 } from "lucide-react";

const clientRegisterSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long"),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm password must match"),
    adminSecret: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Register: React.FC = () => {
  const signup = useAuthStore((state) => state.signup);
  const loading = useAuthStore((state) => state.isLoading);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const adminSecret = formData.get("adminSecret") as string;

    const result = clientRegisterSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      adminSecret: adminSecret || undefined,
    });

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
      await signup(name, email, password, adminSecret || undefined);
      toast("Account registered successfully!", "success");
      const user = useAuthStore.getState().authUser;
      if (user?.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast(error.message || "Registration failed", "error");
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-slate-900/60 border border-gray-800 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-3 border border-blue-500/20">
            <Shield className="w-6 h-6 text-blue-500 fill-blue-500/10" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Create Account</h2>
          <p className="text-sm text-gray-400 mt-1">Start selling your digital accounts securely</p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-[#070b13] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-400 mt-1 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#070b13] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-400 mt-1 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
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
                className="w-full pl-10 pr-4 py-2.5 bg-[#070b13] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-400 mt-1 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#070b13] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-rose-400 mt-1 font-medium">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Admin Registration Toggle */}
          <div className="pt-1 text-right">
            <button
              type="button"
              onClick={() => setShowAdminSecret(!showAdminSecret)}
              className="text-xs text-gray-500 hover:text-blue-400 font-medium transition-colors"
            >
              {showAdminSecret ? "Hide Admin Privilege" : "Register as Admin?"}
            </button>
          </div>

          {/* Admin Secret Key Input */}
          {showAdminSecret && (
            <div className="p-4 bg-slate-950/40 border border-gray-800/80 rounded-xl space-y-2">
              <label className="block text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                Admin Secret Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-rose-500/50">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="adminSecret"
                  placeholder="Enter administrator key"
                  className="w-full pl-10 pr-4 py-2 bg-[#09050d] border border-rose-950/30 rounded-lg text-sm text-white placeholder-gray-700 focus:outline-none focus:border-rose-500/60 transition-colors"
                />
              </div>
              <p className="text-[10px] text-gray-500 leading-normal">
                Requires the platform verification key to authenticate and grant admin permissions on registration.
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-lg shadow-blue-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

