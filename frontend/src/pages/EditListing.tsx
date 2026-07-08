import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useToast } from "../components/Toast.js";
import { Upload, X, Loader2, ChevronLeft } from "lucide-react";

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

import { useListingStore } from "../stores/useListingStore";

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const currentListing = useListingStore((state) => state.currentListing);
  const loadingListing = useListingStore((state) => state.isLoading);
  const fetchListingDetails = useListingStore((state) => state.fetchListingDetails);
  const updateListing = useListingStore((state) => state.updateListing);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Controlled form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"Gaming" | "Social Media" | "Other">("Gaming");
  const [platform, setPlatform] = useState("");
  const [price, setPrice] = useState("");
  const [accountLevel, setAccountLevel] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");

  // Fetch current listing details
  useEffect(() => {
    if (id) {
      fetchListingDetails(id);
    }
  }, [id, fetchListingDetails]);

  // Sync form states with store data
  useEffect(() => {
    if (currentListing) {
      setTitle(currentListing.title);
      setCategory(currentListing.category);
      setPlatform(currentListing.platform);
      setPrice(currentListing.price.toString());
      setAccountLevel(currentListing.accountLevel);
      setCountry(currentListing.country);
      setDescription(currentListing.description);
    }
  }, [currentListing]);

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

  // Clean up object URLs
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
    if (!id) return;

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
    setIsSaving(true);

    const submitFormData = new FormData();
    submitFormData.append("title", title);
    submitFormData.append("description", description);
    submitFormData.append("price", price);
    submitFormData.append("category", category);
    submitFormData.append("platform", platform);
    submitFormData.append("accountLevel", accountLevel);
    submitFormData.append("country", country);

    // If new files are selected, append them
    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        submitFormData.append("images", file);
      });
    }

    try {
      await updateListing(id, submitFormData);
      toast("Listing updated successfully! Re-submitted for review.", "success");
      navigate("/dashboard");
    } catch (err: any) {
      toast(err.response?.data?.message || "Failed to update listing", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingListing) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Edit Listing</h1>
        <p className="text-sm text-gray-400">Update your account listings. Note: Edits will require admin re-verification.</p>
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white transition-colors"
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
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
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
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white transition-colors"
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white transition-colors"
              />
              {errors.price && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.price}</p>
              )}
            </div>

            {/* Level */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Account Level / Followers
              </label>
              <input
                type="text"
                value={accountLevel}
                onChange={(e) => setAccountLevel(e.target.value)}
                className="w-full bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white transition-colors"
              />
              {errors.accountLevel && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.accountLevel}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Country / Region Server
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white transition-colors"
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full bg-[#070b13] border border-gray-800 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white transition-colors whitespace-pre-wrap"
              />
              {errors.description && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.description}</p>
              )}
            </div>

            {/* Existing Images Display */}
            {currentListing && currentListing.images.length > 0 && selectedFiles.length === 0 && (
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Active Images
                </label>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {currentListing.images.map((img: any) => (
                    <div key={img.id} className="relative aspect-video w-24 rounded-xl overflow-hidden border border-gray-800 bg-slate-950">
                      <img src={img.imageUrl} alt="current asset" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-gray-500 italic block">
                  To change screenshots, upload new files below. This will overwrite current ones.
                </span>
              </div>
            )}

            {/* Images upload */}
            <div className="md:col-span-2 space-y-3">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Upload New Images (Overwrites existing photos)
              </label>

              {/* Drop area */}
              <div className="relative border-2 border-dashed border-gray-800 hover:border-blue-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-[#070b13]/40">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={selectedFiles.length >= 5}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <Upload className="w-10 h-10 text-gray-500 mb-3" />
                <p className="text-sm font-semibold text-white">Click or drag images here to upload new ones</p>
                <p className="text-xs text-gray-500 mt-1">Leave empty to keep existing listing screenshots.</p>
                <span className="text-[10px] text-gray-400 mt-3 font-semibold uppercase tracking-wider bg-slate-900 border border-gray-800 px-3 py-1 rounded-full">
                  {selectedFiles.length} of 5 selected
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
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListing;
