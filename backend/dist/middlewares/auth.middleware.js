import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import prisma from "../lib/prisma.js";
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: {
                id: decodedToken.id
            },
            select: {
                id: true,
                role: true,
                email: true,
                name: true
            }
        });
        if (!user) {
            throw new ApiError(401, "Invalid Token");
        }
        req.userId = user.id;
        req.user = user;
        next();
    }
    catch (error) {
        throw new ApiError(401, error?.message || "Invalid token");
    }
});
export const verifyAdmin = asyncHandler(async (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        throw new ApiError(403, "Access denied. Admins only.");
    }
    next();
});
//# sourceMappingURL=auth.middleware.js.map