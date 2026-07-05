import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getListings, getListingById, createListing, updateListing, deleteListing, } from "../controllers/listing.controller.js";
const listingRouter = Router();
// Public routes
listingRouter.get("/", getListings);
listingRouter.get("/:id", getListingById);
// Protected routes (require logging in)
listingRouter.post("/", verifyJWT, upload.array("images", 5), createListing);
listingRouter.put("/:id", verifyJWT, upload.array("images", 5), updateListing);
listingRouter.delete("/:id", verifyJWT, deleteListing);
export default listingRouter;
//# sourceMappingURL=listing.route.js.map