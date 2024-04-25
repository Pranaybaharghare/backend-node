import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
export const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization"?.replace("Bearer ", ""));
        if (!accessToken) {
            throw new ApiError(400, "token not found in cookies")
        }
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(400, "invalid token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(400, error || "something went wrong in auth middleware");
    }

})