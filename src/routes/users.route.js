import { Router } from "express";
import { getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logout, refreshAccessToken, registerUser, updateAccountDetails, updateAvatarOrCoverImage, updatePassword } from "../controllers/users.controller.js";
import { uploadUserDataMulter } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const userRouter = Router();

userRouter.route("/register").post(
  uploadUserDataMulter, registerUser);

userRouter.route("/login").post(loginUser)

//secured routes
userRouter.route("/logout").get(verifyJwt, logout)
userRouter.route("/refreshToken").get(refreshAccessToken)
userRouter.route("/updatePassword").post(verifyJwt, updatePassword)
userRouter.route("/currentUser").get(verifyJwt,getCurrentUser)
userRouter.route("/updateAccountDetails").post(verifyJwt,updateAccountDetails)
userRouter.route("/updateAvatarOrCoverImage").post(verifyJwt,uploadUserDataMulter,updateAvatarOrCoverImage)
userRouter.route("/channel/:userName").post(verifyJwt,getUserChannelProfile)
userRouter.route("/watchHistory").post(verifyJwt,getWatchHistory)
export default userRouter;


