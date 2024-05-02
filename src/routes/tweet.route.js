import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets } from "../controllers/tweet.controller.js";

const tweetRouter = Router();

tweetRouter.route("/createTweet").post(verifyJwt,createTweet)
tweetRouter.route("/getUserTweets/:userId").post(verifyJwt,getUserTweets)
tweetRouter.route("/deleteTweet").post(verifyJwt,deleteTweet)

export default tweetRouter;