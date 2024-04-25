import { Router } from "express";
import { getCurrentUser, loginUser, logout, refreshAccessToken, registerUser, updatePassword } from "../controllers/users.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const userRouter = Router();

userRouter.route("/register").post(
  upload, registerUser);

userRouter.route("/login").post(loginUser)

//secured routes
userRouter.route("/logout").get(verifyJwt, logout)
userRouter.route("/refresh-token").get(refreshAccessToken)
userRouter.route("/updatePassword").post(verifyJwt, updatePassword)
userRouter.route("/currentUser").get(verifyJwt,getCurrentUser)
export default userRouter;


