import { Router } from "express";
import {loginUser, registerUser} from "../controllers/users.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
  const userRouter = Router();

  userRouter.route("/register").post(
    upload,registerUser);
  
    userRouter.route("/login").post(loginUser)
  export default userRouter;


