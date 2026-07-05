import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getUserProfile, updateUserProfile, } from "../controllers/user.controller.js";
const userRouter = Router();
userRouter
    .route("/profile")
    .get(verifyJWT, getUserProfile)
    .put(verifyJWT, upload.single("avatar"), updateUserProfile);
export default userRouter;
//# sourceMappingURL=user.route.js.map