import prisma from "../lib/prisma.js";
import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { profileUpdateSchema } from "../utils/schemas.js";

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Calculate stats for user's listings
  const [draft, pending, verified, rejected, sold] = await Promise.all([
    prisma.listing.count({ where: { sellerId: userId, status: "DRAFT" } }),
    prisma.listing.count({ where: { sellerId: userId, status: "PENDING" } }),
    prisma.listing.count({ where: { sellerId: userId, status: "VERIFIED" } }),
    prisma.listing.count({ where: { sellerId: userId, status: "REJECTED" } }),
    prisma.listing.count({ where: { sellerId: userId, status: "SOLD" } }),
  ]);

  const listingsStats = {
    DRAFT: draft,
    PENDING: pending,
    VERIFIED: verified,
    REJECTED: rejected,
    SOLD: sold,
    TOTAL: draft + pending + verified + rejected + sold,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        stats: listingsStats,
      },
      "User profile and stats fetched successfully"
    )
  );
});

export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const { name } = req.body;

  const parsed = profileUpdateSchema.safeParse({ name });
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid input data");
  }

  let avatarUrl: string | undefined = undefined;

  if (req.file) {
    const localFilePath = req.file.path;
    const uploadResult = await uploadOnCloudinary(localFilePath);
    if (uploadResult) {
      avatarUrl = uploadResult.secure_url;
    } else {
      throw new ApiError(500, "Error uploading avatar to Cloudinary");
    }
  }

  // Dynamically build data object to satisfy exactOptionalPropertyTypes: true
  const updateData: { name?: string; avatar?: string } = {};
  if (name) {
    updateData.name = name;
  }
  if (avatarUrl) {
    updateData.avatar = avatarUrl;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      createdAt: true,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { user: updatedUser }, "Profile updated successfully"));
});
