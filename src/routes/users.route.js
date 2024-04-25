import { Router } from "express";
import { loginUser, logout, registerUser } from "../controllers/users.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middlewre.js";
const userRouter = Router();

userRouter.route("/register").post(
  upload, registerUser);

userRouter.route("/login").post(loginUser)

//secured routes
userRouter.route("/logout").get(verifyJwt, logout)
export default userRouter;


