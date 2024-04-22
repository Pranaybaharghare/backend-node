import { Router } from "express";
import registerUser from "../controllers/users.controller.js";
  const userRouter = Router();

  userRouter.route("/hello").post(registerUser);

  export default userRouter;


