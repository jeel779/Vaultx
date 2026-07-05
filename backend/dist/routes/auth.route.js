import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { registerUser, loginUser, logoutUser, getCurrentUser, } from "../controllers/auth.controller.js";
const authRouter = Router();
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);
authRouter.get("/me", verifyJWT, getCurrentUser);
export default authRouter;
//# sourceMappingURL=auth.route.js.map