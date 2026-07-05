import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { loginSchema, userSchema } from "../utils/schemas.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
export const controllernane = asyncHandler(async (req, res) => {
    //body 
    const { something } = req.body;
    if (!something) {
        throw new ApiError(400, "Invalid user data");
    }
    return res.status(200).json(new ApiResponse(200, something, " message "));
});
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { success } = loginSchema.safeParse({ email, password });
    if (!success) {
        throw new ApiError(400, "Invalid user data");
    }
    const user = await prisma.user.findUnique({
        where: {
            email
        },
        select: {
            id: true,
            email: true,
            username: true,
            password: true,
        }
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid user credentials");
    }
    const loggedInUser = await prisma.user.findUnique({
        where: {
            id: user.id
        },
        select: {
            id: true,
            email: true,
            username: true,
        }
    });
    if (!loggedInUser) {
        throw new ApiError(404, "User not found");
    }
    const payload = {
        id: loggedInUser.id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });
    const options = {
        httpOnly: true,
        secure: true
    };
    return res
        .status(200)
        .cookie("token", token, options)
        .json(new ApiResponse(200, {
        user: loggedInUser, token,
    }, "User logged In Successfully"));
});
export const logoutUser = asyncHandler(async (req, res) => {
    const options = {
        httpOnly: true,
        secure: true
    };
    return res
        .status(200)
        .clearCookie("token", options)
        .json(new ApiResponse(200, {}, "User logged Out"));
});
export const checkAuth = asyncHandler(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            email: true,
            username: true
        }
    });
    if (!user) {
        throw new ApiError(401, "User not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {
        user
    }, "User is already logged in"));
});
//# sourceMappingURL=something.controller.js.map