import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addComment } from "../controllers/comment.controller.js";

const commentRouter = Router();

commentRouter.route("/addComment/:videoId").post(verifyJwt,addComment)

export default commentRouter;