import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  sendMessage,
  getConversations,
  getConversationWithUser,
} from "../controllers/message.controller.js";

const messageRouter = Router();

// Secure all messaging endpoints
messageRouter.use(verifyJWT);

messageRouter.post("/", sendMessage);
messageRouter.get("/conversations", getConversations);
messageRouter.get("/conversation/:userId", getConversationWithUser);

export default messageRouter;
