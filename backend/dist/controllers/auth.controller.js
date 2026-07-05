import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { loginSchema, userSchema } from "../utils/schemas.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax"),
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
};
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, adminSecret } = req.body;
    const parsed = userSchema.safeParse({ name, email, password, adminSecret });
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid input data");
    }
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }
    // Handle admin secret verification
    let userRole = "USER";
    if (adminSecret) {
        if (adminSecret === (process.env.ADMIN_SECRET_KEY || "vaultx_admin_secret")) {
            userRole = "ADMIN";
        }
        else {
            throw new ApiError(400, "Invalid admin secret key");
        }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: userRole,
        },
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            createdAt: true,
        },
    });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });
    return res
        .status(201)
        .cookie("token", token, COOKIE_OPTIONS)
        .json(new ApiResponse(201, { user, token }, "User registered successfully"));
});
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid email or password");
    }
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid email or password");
    }
    const loggedInUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
    };
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });
    return res
        .status(200)
        .cookie("token", token, COOKIE_OPTIONS)
        .json(new ApiResponse(200, { user: loggedInUser, token }, "Logged in successfully"));
});
export const logoutUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .clearCookie("token", COOKIE_OPTIONS)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});
export const getCurrentUser = asyncHandler(async (req, res) => {
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
    return res
        .status(200)
        .json(new ApiResponse(200, { user }, "User profile fetched successfully"));
});
//# sourceMappingURL=auth.controller.js.map