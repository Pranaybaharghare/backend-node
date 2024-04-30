import { Router } from "express";
import { deleteVideoById, getAllVideos, getVideoById, getVideosByUserId, publishVideo, updateVideoDetails, uploadVideo } from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { uploadVideoMulter } from "../middlewares/multer.middleware.js";

const videoRouter = Router();

videoRouter.route("/getAllVideo").get(verifyJwt, getAllVideos)
videoRouter.route("/uploadVideo").post(verifyJwt, uploadVideoMulter, uploadVideo)
videoRouter.route("/channel/:userName").post(verifyJwt, getVideosByUserId)
videoRouter.route("/:videoId").post(verifyJwt, getVideoById)
videoRouter.route("/updateVideoDetails/:videoId").post(verifyJwt, uploadVideoMulter, updateVideoDetails)
videoRouter.route("/deleteVideoById/:videoId").post(verifyJwt,deleteVideoById)
videoRouter.route("/publishVideo/:videoId").post(verifyJwt,publishVideo)
export default videoRouter;