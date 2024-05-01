import { Router } from "express";
import {verifyJwt} from "../middlewares/auth.middleware.js"
import { toggleSubscription } from "../controllers/subscription.controller.js";
const subscriptionRouter = Router();

subscriptionRouter.route("/toggleSubscription/:channelId").post(verifyJwt,toggleSubscription)

export default subscriptionRouter;