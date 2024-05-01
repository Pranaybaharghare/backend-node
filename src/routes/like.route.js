import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { toggleVideoLike } from "../controllers/like.controller.js";

const likeRouter = Router();

likeRouter.route("/toggleVideoLike/:videoId").post(verifyJwt,toggleVideoLike)
export default likeRouter;