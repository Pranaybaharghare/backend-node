import { Router } from "express";
import { getAllVideos } from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const videoRouter = Router();

videoRouter.route("/getAllVideo").get(verifyJwt,getAllVideos)
export default videoRouter;