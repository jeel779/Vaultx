import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { controllernane } from "../controllers/something.controller.js";
const somethingRouter = Router();
somthingRouter.route("/path").get(upload.single("avatar"), verifyJWT, controllernane);
export default authRouter;
//# sourceMappingURL=something.route.js.map