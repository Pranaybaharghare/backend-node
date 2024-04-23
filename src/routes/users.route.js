import { Router } from "express";
import {registerUser} from "../controllers/users.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
  const userRouter = Router();

  userRouter.route("/register").post(
    upload,registerUser);

  export default userRouter;


