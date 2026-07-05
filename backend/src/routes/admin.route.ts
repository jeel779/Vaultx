import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
  getPendingListings,
  approveListing,
  rejectListing,
  getAllUsers,
  deleteUser,
  updateUserRole,
} from "../controllers/admin.controller.js";

const adminRouter = Router();

// Secure all admin endpoints
adminRouter.use(verifyJWT, verifyAdmin);

adminRouter.get("/listings/pending", getPendingListings);
adminRouter.patch("/listings/:id/approve", approveListing);
adminRouter.patch("/listings/:id/reject", rejectListing);
adminRouter.get("/users", getAllUsers);
adminRouter.patch("/users/:id/role", updateUserRole);
adminRouter.delete("/users/:id", deleteUser);

export default adminRouter;
