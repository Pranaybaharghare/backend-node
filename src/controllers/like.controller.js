import { Like } from "../models/likes.model.js";
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
import { Video } from "../models/video.model.js";
import mongoose, { mongo } from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(404, "videoId not found");
    }
    let video = await Video.findById(videoId);
    const isAlreadyLiked = await Like.findOne({ video: new mongoose.Types.ObjectId(videoId), likedBy: new mongoose.Types.ObjectId(req.user?._id) });
    if (isAlreadyLiked) {
        const deletedLike = await Like.deleteOne({ _id: new mongoose.Types.ObjectId(isAlreadyLiked?._id) });
        video.like -= 1;
        await video.save({ validateBeforeSave: false })
        return res
            .status(200)
            .json(new ApiResponse(200, deletedLike, "remove like successfully"))
    }
    const likedVideo = await Like.create({
        video: videoId,
        likedBy: req.user._id
    })

    video.like += 1;
    await video.save({ validateBeforeSave: false })

    if (!likedVideo) {
        throw new ApiError(400, "video unable to like");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideo, "video liked successfully"))

});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

})
export { toggleVideoLike,
         toggleCommentLike }