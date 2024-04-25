import { Router } from "express";
import { loginUser, logout, refreshAccessToken, registerUser } from "../controllers/users.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middlewre.js";
const userRouter = Router();

userRouter.route("/register").post(
  upload, registerUser);

userRouter.route("/login").post(loginUser)

//secured routes
userRouter.route("/logout").get(verifyJwt, logout)
userRouter.route("/refresh-token").get(refreshAccessToken)
export default userRouter;


