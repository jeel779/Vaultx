import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useListingStore } from "../stores/useListingStore";
import { useToast } from "../components/Toast.js";
import { Upload, X, Loader2 } from "lucide-react";

// Form validation schema
const clientListingSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters long"),
  description: z.string().trim().min(10, "Description must be at least 10 characters long"),
  price: z.string().min(1, "Price is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Price must be a positive number",
  }),
  category: z.enum(["Gaming", "Social Media", "Other"]),
  platform: z.string().trim().min(1, "Platform is required"),
  accountLevel: z.string().trim().min(1, "Account level is required"),
  country: z.string().trim().min(1, "Country is required"),
});

const CreateListing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const createListing = useListingStore((state) => state.createListing);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle files select & preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (selectedFiles.length + files.length > 5) {
      toast("You can upload a maximum of 5 images", "error");
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast("Please upload at least 1 image of the account", "error");
      return;
    }

    const formDataObj = new FormData(e.currentTarget);
    const title = formDataObj.get("title") as string;
    const category = formDataObj.get("category") as string;
    const platform = formDataObj.get("platform") as string;
    const price = formDataObj.get("price") as string;
    const accountLevel = formDataObj.get("accountLevel") as string;
    const country = formDataObj.get("country") as string;
    const description = formDataObj.get("description") as string;

    const result = clientListingSchema.safeParse({
      title,
      category,
      platform,
      price,
      accountLevel,
      country,
      description,
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
    setIsSubmitting(true);

    const submitFormData = new FormData();
    submitFormData.append("title", title);
    submitFormData.append("description", description);
    submitFormData.append("price", price);
    submitFormData.append("category", category);
    submitFormData.append("platform", platform);
    submitFormData.append("accountLevel", accountLevel);
    submitFormData.append("country", country);
    
    selectedFiles.forEach((file) => {
      submitFormData.append("images", file);
    });

    try {
      await createListing(submitFormData);
      toast("Listing submitted for review successfully!", "success");
      navigate("/dashboard");
    } catch (err: any) {
      toast(err.response?.data?.message || "Failed to create listing", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Sell Account</h1>
        <p className="text-sm text-gray-400">List your digital asset. Our admin team will verify it within 24 hours.</p>
      </div>

      <div className="bg-slate-900/40 border border-gray-800 p-6 sm:p-8 rounded-2xl backdrop-blur-md shadow-2xl">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Listing Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Stacked OG Valorant Account - Reaver Vandal & Elderflame Dagger"
                className="w-full bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors"
              />
              {errors.title && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                name="category"
                defaultValue="Gaming"
                className="w-full bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white transition-colors"
              >
                <option value="Gaming">Gaming</option>
                <option value="Social Media">Social Media</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.category}</p>
              )}
            </div>

            {/* Platform */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Platform / Game Name
              </label>
              <input
                type="text"
                name="platform"
                placeholder="e.g. Valorant, PUBG, Instagram, YouTube"
                className="w-full bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors"
              />
              {errors.platform && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.platform}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Asking Price (₹ INR)
              </label>
              <input
                type="text"
                name="price"
                placeholder="e.g. 8500"
                className="w-full bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors"
              />
              {errors.price && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.price}</p>
              )}
            </div>

            {/* Level */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Account Level / Follower Count
              </label>
              <input
                type="text"
                name="accountLevel"
                placeholder="e.g. Lv. 140, 15K Followers"
                className="w-full bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors"
              />
              {errors.accountLevel && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.accountLevel}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Country / Server Region
              </label>
              <input
                type="text"
                name="country"
                placeholder="e.g. USA, NA-East, Global, India"
                className="w-full bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors"
              />
              {errors.country && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.country}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Description / Inventory Details
              </label>
              <textarea
                name="description"
                placeholder="Describe your account details, inventory, rare items, skins, verification evidence, etc."
                rows={5}
                className="w-full bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors whitespace-pre-wrap"
              />
              {errors.description && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.description}</p>
              )}
            </div>

            {/* Images upload */}
            <div className="md:col-span-2 space-y-3">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Upload Images / Screenshots (1 to 5)
              </label>
              
              {/* Drop area */}
              <div className="relative border-2 border-dashed border-gray-800 hover:border-blue-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#070b13]/40">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={selectedFiles.length >= 5}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <Upload className="w-10 h-10 text-gray-500 mb-3" />
                <p className="text-sm font-semibold text-white">Click or drag images here to upload</p>
                <p className="text-xs text-gray-500 mt-1">Upload screenshots showing level, logs, and account dashboard to verify proof</p>
                <span className="text-[10px] text-gray-400 mt-3 font-semibold uppercase tracking-wider bg-slate-900 border border-gray-800 px-3 py-1 rounded-full">
                  {selectedFiles.length} of 5 uploaded
                </span>
              </div>

              {/* Previews grid */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={preview} className="relative aspect-video rounded-xl overflow-hidden border border-gray-800 bg-slate-950 group">
                      <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-slate-900 text-gray-400 hover:text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
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
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Review...</span>
                </>
              ) : (
                <span>Submit for Verification</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
