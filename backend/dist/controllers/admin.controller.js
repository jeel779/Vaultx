import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// GET /admin/listings/pending - View pending listings
export const getPendingListings = asyncHandler(async (req, res) => {
    const listings = await prisma.listing.findMany({
        where: {
            status: "PENDING",
        },
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
        orderBy: {
            createdAt: "asc",
        },
    });
    return res
        .status(200)
        .json(new ApiResponse(200, { listings }, "Pending listings fetched successfully"));
});
// PATCH /admin/listings/:id/approve - Approve listing
export const approveListing = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        throw new ApiError(400, "Listing ID is required");
    }
    const listing = await prisma.listing.findUnique({
        where: { id },
    });
    if (!listing) {
        throw new ApiError(404, "Listing not found");
    }
    if (listing.status !== "PENDING") {
        throw new ApiError(400, "Only pending listings can be approved");
    }
    const updatedListing = await prisma.listing.update({
        where: { id },
        data: {
            status: "VERIFIED",
            rejectionReason: null,
        },
    });
    return res
        .status(200)
        .json(new ApiResponse(200, { listing: updatedListing }, "Listing approved successfully"));
});
// PATCH /admin/listings/:id/reject - Reject listing
export const rejectListing = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        throw new ApiError(400, "Listing ID is required");
    }
    const { rejectionReason } = req.body;
    if (!rejectionReason || typeof rejectionReason !== "string" || rejectionReason.trim() === "") {
        throw new ApiError(400, "Rejection reason is required");
    }
    const listing = await prisma.listing.findUnique({
        where: { id },
    });
    if (!listing) {
        throw new ApiError(404, "Listing not found");
    }
    if (listing.status !== "PENDING") {
        throw new ApiError(400, "Only pending listings can be rejected");
    }
    const updatedListing = await prisma.listing.update({
        where: { id },
        data: {
            status: "REJECTED",
            rejectionReason: rejectionReason.trim(),
        },
    });
    return res
        .status(200)
        .json(new ApiResponse(200, { listing: updatedListing }, "Listing rejected successfully"));
});
// GET /admin/users - Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            createdAt: true,
            _count: {
                select: {
                    listings: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    const formattedUsers = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        listingsCount: user._count.listings,
    }));
    return res
        .status(200)
        .json(new ApiResponse(200, { users: formattedUsers }, "Users fetched successfully"));
});
// DELETE /admin/users/:id - Delete a user
export const deleteUser = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        throw new ApiError(400, "User ID is required");
    }
    const adminId = req.userId;
    if (!adminId) {
        throw new ApiError(401, "Unauthorized");
    }
    if (id === adminId) {
        throw new ApiError(400, "You cannot delete your own admin account");
    }
    const user = await prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    await prisma.user.delete({
        where: { id },
    });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "User deleted successfully"));
});
// PATCH /admin/users/:id/role - Update user's role (promote/demote)
export const updateUserRole = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        throw new ApiError(400, "User ID is required");
    }
    const { role } = req.body;
    if (!role || (role !== "USER" && role !== "ADMIN")) {
        throw new ApiError(400, "Valid role (USER or ADMIN) is required");
    }
    const adminId = req.userId;
    if (!adminId) {
        throw new ApiError(401, "Unauthorized");
    }
    if (id === adminId) {
        throw new ApiError(400, "You cannot modify your own administrator role status");
    }
    const user = await prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const updatedUser = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });
    return res
        .status(200)
        .json(new ApiResponse(200, { user: updatedUser }, `User role updated to ${role} successfully`));
});
//# sourceMappingURL=admin.controller.js.map