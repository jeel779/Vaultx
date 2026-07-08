import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { messageSchema } from "../utils/schemas.js";
import { io, onlineUsers } from "../lib/socket.js";
// POST /messages - Send a message
export const sendMessage = asyncHandler(async (req, res) => {
    const { content, receiverId, listingId } = req.body;
    const senderId = req.userId;
    if (!senderId) {
        throw new ApiError(401, "Unauthorized");
    }
    // Validate request body
    const parsed = messageSchema.safeParse({ content, receiverId, listingId });
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid input data");
    }
    if (senderId === receiverId) {
        throw new ApiError(400, "You cannot send a message to yourself");
    }
    // Verify recipient exists
    const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
    });
    if (!receiver) {
        throw new ApiError(404, "Recipient not found");
    }
    // Verify listing exists
    const listing = await prisma.listing.findUnique({
        where: { id: listingId },
    });
    if (!listing) {
        throw new ApiError(404, "Listing not found");
    }
    const message = await prisma.message.create({
        data: {
            content: content.trim(),
            senderId,
            receiverId: receiverId,
            listingId: listingId,
        },
        include: {
            sender: {
                select: { id: true, name: true, avatar: true },
            },
            receiver: {
                select: { id: true, name: true, avatar: true },
            },
            listing: {
                select: { id: true, title: true, price: true },
            },
        },
    });
    // Send real-time message through socket io if recipient is connected
    if (io && receiverId) {
        const recipientSocketId = onlineUsers.get(receiverId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("receive-message", message);
        }
    }
    return res
        .status(201)
        .json(new ApiResponse(201, { message }, "Message sent successfully"));
});
// GET /messages/conversations - List user's active conversation threads
export const getConversations = asyncHandler(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    // Retrieve all messages involving user
    const messages = await prisma.message.findMany({
        where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
        },
        include: {
            sender: {
                select: { id: true, name: true, email: true, avatar: true },
            },
            receiver: {
                select: { id: true, name: true, email: true, avatar: true },
            },
            listing: {
                select: { id: true, title: true, price: true },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    // Group messages into conversations based on (otherUser.id + listing.id)
    const threadMap = new Map();
    for (const msg of messages) {
        const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
        const threadKey = `${otherUser.id}-${msg.listingId}`;
        if (!threadMap.has(threadKey)) {
            threadMap.set(threadKey, {
                id: msg.id,
                content: msg.content,
                createdAt: msg.createdAt,
                listing: msg.listing,
                otherUser,
            });
        }
    }
    const threads = Array.from(threadMap.values());
    return res
        .status(200)
        .json(new ApiResponse(200, { conversations: threads }, "Conversations fetched successfully"));
});
// GET /messages/conversation/:userId - Chat log with a specific user regarding a listing
export const getConversationWithUser = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const otherUserId = req.params.userId;
    const { listingId } = req.query;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    if (!otherUserId) {
        throw new ApiError(400, "Recipient user ID is required");
    }
    if (!listingId || typeof listingId !== "string") {
        throw new ApiError(400, "Listing ID query param is required and must be a string");
    }
    const messages = await prisma.message.findMany({
        where: {
            listingId: listingId,
            OR: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId },
            ],
        },
        include: {
            sender: {
                select: { id: true, name: true, avatar: true },
            },
            receiver: {
                select: { id: true, name: true, avatar: true },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });
    return res
        .status(200)
        .json(new ApiResponse(200, { messages }, "Chat history fetched successfully"));
});
//# sourceMappingURL=message.controller.js.map