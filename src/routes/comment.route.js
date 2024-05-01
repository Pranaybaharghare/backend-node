import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getAllCommentByVideoId, updateComment } from "../controllers/comment.controller.js";

const commentRouter = Router();

commentRouter.route("/addComment/:videoId").post(verifyJwt,addComment)
commentRouter.route("/updateComment/:videoId").post(verifyJwt,updateComment)
commentRouter.route("/deleteComment/:videoId").post(verifyJwt,deleteComment)
commentRouter.route("/getAllCommentByVideoId/:videoId").post(verifyJwt,getAllCommentByVideoId)

export default commentRouter;