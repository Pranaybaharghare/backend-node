import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createTweet } from "../controllers/tweet.controller.js";

const tweetRouter = Router();

tweetRouter.route("/createTweet").post(verifyJwt,createTweet)

export default tweetRouter;