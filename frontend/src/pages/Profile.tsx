import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../components/Toast.js";
import { User as UserIcon, Camera, Loader2, ArrowLeft, Mail } from "lucide-react";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Pre-populate user name
  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user, setValue]);

  // Handle avatar file selection & local preview
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  // Clean up object URL
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await updateProfile(data.name, avatarFile);
      toast("Profile updated successfully!", "success");
      setAvatarFile(null);
    } catch (error: any) {
      toast(error.message || "Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-grow max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full">
      {/* Back to Dashboard */}
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Profile Settings</h1>
        <p className="text-sm text-gray-400">Update your public profile display information</p>
      </div>

      <div className="bg-slate-900/60 border border-gray-800 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-3 pb-6 border-b border-gray-850">
            <div className="relative group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-500/50"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-600/10 border-2 border-dashed border-blue-500/30 flex items-center justify-center text-blue-400 text-3xl font-black">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Overlay Trigger */}
              <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
                <Camera className="w-5 h-5 text-white" />
                <span className="text-[10px] text-gray-300 font-bold uppercase mt-1">Change</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <span className="text-xs text-gray-500">Click photo to upload new image (PNG, JPG)</span>
          </div>

          <div className="space-y-5">
            {/* Email Address (Disabled/Read-only) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Email Address (Registered)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-600">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full pl-10 pr-4 py-3 bg-[#070b13] border border-gray-850 rounded-xl text-sm text-gray-500 cursor-not-allowed focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-gray-600 block mt-1.5 leading-none">
                Email address cannot be changed. Contact support if you need assistance.
              </span>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Display Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Your Name"
                  {...register("name")}
                  className="w-full pl-10 pr-4 py-3 bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 rounded-xl text-sm text-white transition-colors"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 justify-end">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="bg-gray-850 hover:bg-gray-800 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
