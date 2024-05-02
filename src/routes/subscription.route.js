import { Router } from "express";
import {verifyJwt} from "../middlewares/auth.middleware.js"
import { getChannelSubscribers, getUserSubscribedChannels, toggleSubscription } from "../controllers/subscription.controller.js";
const subscriptionRouter = Router();

subscriptionRouter.route("/toggleSubscription/:channelId").post(verifyJwt,toggleSubscription)
subscriptionRouter.route("/getChannelSubscribers/:channelId").post(verifyJwt,getChannelSubscribers)
subscriptionRouter.route("/getUserSubscribedChannels").get(verifyJwt,getUserSubscribedChannels)

export default subscriptionRouter;