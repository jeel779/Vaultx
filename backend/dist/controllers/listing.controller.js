import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { listingSchema } from "../utils/schemas.js";
// GET /listings - Public Explore (filters, search, sorting, pagination)
export const getListings = asyncHandler(async (req, res) => {
    const { category, platform, minPrice, maxPrice, search, status, sellerId, sortBy = "newest", page = "1", limit = "10", } = req.query;
    const pageNum = parseInt(typeof page === "string" ? page : "1", 10) || 1;
    const limitNum = parseInt(typeof limit === "string" ? limit : "10", 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    // Build query conditions dynamically
    const where = {};
    if (status && typeof status === "string") {
        where.status = status;
    }
    else {
        where.status = "VERIFIED";
    }
    if (sellerId && typeof sellerId === "string") {
        where.sellerId = sellerId;
    }
    if (category && typeof category === "string") {
        where.category = category;
    }
    if (platform && typeof platform === "string") {
        where.platform = {
            equals: platform,
            mode: "insensitive",
        };
    }
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice && typeof minPrice === "string") {
            const min = parseFloat(minPrice);
            if (!isNaN(min)) {
                where.price.gte = min;
            }
        }
        if (maxPrice && typeof maxPrice === "string") {
            const max = parseFloat(maxPrice);
            if (!isNaN(max)) {
                where.price.lte = max;
            }
        }
    }
    if (search && typeof search === "string") {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { platform: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
        ];
    }
    // Sorting
    let orderBy = { createdAt: "desc" };
    if (sortBy === "oldest") {
        orderBy = { createdAt: "asc" };
    }
    else if (sortBy === "priceAsc") {
        orderBy = { price: "asc" };
    }
    else if (sortBy === "priceDesc") {
        orderBy = { price: "desc" };
    }
    const [listings, totalCount] = await Promise.all([
        prisma.listing.findMany({
            where,
            include: {
                images: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
            orderBy,
            skip,
            take: limitNum,
        }),
        prisma.listing.count({ where }),
    ]);
    return res.status(200).json(new ApiResponse(200, {
        listings,
        pagination: {
            total: totalCount,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(totalCount / limitNum),
        },
    }, "Listings fetched successfully"));
});
// GET /listings/:id - Listing Details + Related listings
export const getListingById = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        throw new ApiError(400, "Listing ID is required");
    }
    const listing = await prisma.listing.findUnique({
        where: { id },
        include: {
            images: true,
            seller: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    createdAt: true,
                },
            },
        },
    });
    if (!listing) {
        throw new ApiError(404, "Listing not found");
    }
    // Fetch related listings (same category or platform, verified, up to 4, excluding current)
    const relatedListings = await prisma.listing.findMany({
        where: {
            id: { not: id },
            status: "VERIFIED",
            OR: [
                { category: listing.category },
                { platform: listing.platform },
            ],
        },
        include: {
            images: true,
        },
        take: 4,
        orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(new ApiResponse(200, {
        listing,
        relatedListings,
    }, "Listing details fetched successfully"));
});
// POST /listings - Create Listing
export const createListing = asyncHandler(async (req, res) => {
    const { title, description, price, category, platform, accountLevel, country } = req.body;
    const sellerId = req.userId;
    if (!sellerId) {
        throw new ApiError(401, "Unauthorized");
    }
    // Validate request body
    const parsed = listingSchema.safeParse({
        title,
        description,
        price,
        category,
        platform,
        accountLevel,
        country,
    });
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid input data");
    }
    // Handle uploaded images (Multer stores files in req.files)
    const files = req.files;
    if (!files || files.length === 0) {
        throw new ApiError(400, "Please upload at least 1 image of the account");
    }
    if (files.length > 5) {
        throw new ApiError(400, "Maximum of 5 images can be uploaded");
    }
    // Upload to Cloudinary
    const imageUrls = [];
    for (const file of files) {
        const uploadResult = await uploadOnCloudinary(file.path);
        if (uploadResult) {
            imageUrls.push(uploadResult.secure_url);
        }
    }
    if (imageUrls.length === 0) {
        throw new ApiError(500, "Failed to upload images. Please try again.");
    }
    // Create listing in Database
    const listing = await prisma.listing.create({
        data: {
            title,
            description,
            price: parseFloat(price),
            category,
            platform,
            accountLevel,
            country,
            status: "PENDING", // Initial status
            sellerId,
            images: {
                create: imageUrls.map((url) => ({ imageUrl: url })),
            },
        },
        include: {
            images: true,
        },
    });
    return res
        .status(201)
        .json(new ApiResponse(201, { listing }, "Listing submitted for verification successfully"));
});
// PUT /listings/:id - Update Listing
export const updateListing = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        throw new ApiError(400, "Listing ID is required");
    }
    const { title, description, price, category, platform, accountLevel, country, status } = req.body;
    const userId = req.userId;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    const listing = await prisma.listing.findUnique({
        where: { id },
    });
    if (!listing) {
        throw new ApiError(404, "Listing not found");
    }
    // Authorization check (only owner or admin can edit)
    const isAdmin = req.user?.role === "ADMIN";
    if (listing.sellerId !== userId && !isAdmin) {
        throw new ApiError(403, "You do not have permission to edit this listing");
    }
    // Validate text fields
    const parsed = listingSchema.safeParse({
        title,
        description,
        price,
        category,
        platform,
        accountLevel,
        country,
    });
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid input data");
    }
    let finalStatus = listing.status;
    // If edited by the seller and status was rejected or draft, put back to PENDING verification
    if (!isAdmin) {
        if (listing.status === "REJECTED" || listing.status === "DRAFT" || status === "PENDING") {
            finalStatus = "PENDING";
        }
    }
    else if (status && typeof status === "string") {
        // If admin is updating, respect the status
        finalStatus = status;
    }
    // Check if new images are uploaded
    const files = req.files;
    let newImageUrls = [];
    if (files && files.length > 0) {
        if (files.length > 5) {
            throw new ApiError(400, "Maximum of 5 images can be uploaded");
        }
        for (const file of files) {
            const uploadResult = await uploadOnCloudinary(file.path);
            if (uploadResult) {
                newImageUrls.push(uploadResult.secure_url);
            }
        }
    }
    // Update transaction
    const updatedListing = await prisma.$transaction(async (tx) => {
        // If new images uploaded, clear the old ones first
        if (newImageUrls.length > 0) {
            await tx.listingImage.deleteMany({
                where: { listingId: id },
            });
        }
        // Build update data to avoid undefined values which violate exactOptionalPropertyTypes: true
        const updateData = {
            title,
            description,
            price: parseFloat(price),
            category,
            platform,
            accountLevel,
            country,
            status: finalStatus,
        };
        if (finalStatus === "PENDING") {
            updateData.rejectionReason = null;
        }
        if (newImageUrls.length > 0) {
            updateData.images = {
                create: newImageUrls.map((url) => ({ imageUrl: url })),
            };
        }
        return await tx.listing.update({
            where: { id },
            data: updateData,
            include: {
                images: true,
            },
        });
    });
    return res
        .status(200)
        .json(new ApiResponse(200, { listing: updatedListing }, "Listing updated successfully"));
});
// DELETE /listings/:id - Delete Listing
export const deleteListing = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        throw new ApiError(400, "Listing ID is required");
    }
    const userId = req.userId;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    const listing = await prisma.listing.findUnique({
        where: { id },
    });
    if (!listing) {
        throw new ApiError(404, "Listing not found");
    }
    const isAdmin = req.user?.role === "ADMIN";
    if (listing.sellerId !== userId && !isAdmin) {
        throw new ApiError(403, "You do not have permission to delete this listing");
    }
    await prisma.listing.delete({
        where: { id },
    });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Listing deleted successfully"));
});
//# sourceMappingURL=listing.controller.js.map