import { Like } from "../models/likes.model.js";
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
import { Video } from "../models/video.model.js";
import mongoose, { mongo } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js"
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(404, "videoId not found");
    }
    let video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "video not found")
    }
    const isAlreadyLiked = await Like.findOne({ video: new mongoose.Types.ObjectId(videoId), likedBy: new mongoose.Types.ObjectId(req.user?._id) });
    if (isAlreadyLiked) {
        const deletedVideoLike = await Like.deleteOne({ _id: new mongoose.Types.ObjectId(isAlreadyLiked?._id) });
        video.like -= 1;
        await video.save({ validateBeforeSave: false })
        return res
            .status(200)
            .json(new ApiResponse(200, deletedVideoLike, "remove like from video successfully"))
    }
    const likedVideo = await Like.create({
        video: videoId,
        likedBy: req.user._id
    })

    if (!likedVideo) {
        throw new ApiError(400, "video unable to like");
    }

    video.like += 1;
    await video.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideo, "video liked successfully"))

});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(404, "commentId not found");
    }

    const comment = await Comment.findById(new mongoose.Types.ObjectId(commentId));
    if (!comment) {
        throw new ApiError(400, "comment is not found");
    }

    const isAlreadyLiked = await Like.findOne({ comment: new mongoose.Types.ObjectId(commentId), likedBy: new mongoose.Types.ObjectId(req.user?._id) });

    if (isAlreadyLiked) {
        const deletedCommentLike = await Like.deleteOne({ _id: new mongoose.Types.ObjectId(isAlreadyLiked?._id) });
        comment.commentLike -= 1;
        await comment.save({ validateBeforeSave: false })
        return res
            .status(200)
            .json(new ApiResponse(200, deletedCommentLike, "remove like from comment successfully"))
    }

    const likedComment = await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    if (!likedComment) {
        throw new ApiError(400, "comment unable to like")
    }

    comment.commentLike += 1;
    await comment.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, likedComment, "comment liked successfully"))
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!tweetId) {
        throw new ApiError(404, "tweetId not found");
    }

    const tweet = await Tweet.findById(new mongoose.Types.ObjectId(tweetId));
    if (!tweet) {
        throw new ApiError(400, "tweet not found ")
    }

    const isAlreadyLiked = await Like.findOne({ tweet: new mongoose.Types.ObjectId(tweetId), likedBy: new mongoose.Types.ObjectId(req.user._id) });
    if (isAlreadyLiked) {
        const deletedTweetLike = await Tweet.deleteOne(new mongoose.Types.ObjectId(isAlreadyLiked?._id));
        tweet.tweetLike -= 1;
        await tweet.save({ validateBeforeSave: false });

        return res
            .status(200)
            .json(new ApiResponse(200, deletedTweetLike, "remove like from tweet successfully"))
    }


    const likedTweet = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    if (!likedTweet) {
        throw new ApiError(400, "tweet is unable to like");
    }

    tweet.tweetLike += 1;
    await tweet.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, likedTweet, "tweet liked successfully"))
}
);

const getLikedVideos = asyncHandler(async (req, res) => {
    const getLikedVideos = await Like.aggregate([
        {
            $match: {
                video: {
                    $exists: true,
                },
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
            },
        },
        {
            $addFields: {
                videoTitle: {
                    $arrayElemAt: [
                        "$videoDetails.title",
                        0,
                    ],
                },
                videoDescription: {
                    $arrayElemAt: [
                        "$videoDetails.description",
                        0,
                    ],
                },
                videoThumbnail: {
                    $arrayElemAt: [
                        "$videoDetails.thumbnail",
                        0,
                    ],
                },
                videoFile: {
                    $arrayElemAt: [
                        "$videoDetails.videoFile",
                        0,
                    ],
                },
                videoOwner: {
                    $arrayElemAt: [
                        "$videoDetails.owner",
                        0,
                    ],
                },
                videoDuration: {
                    $arrayElemAt: [
                        "$videoDetails.duration",
                        0,
                    ],
                },
                videoLike: {
                    $arrayElemAt: [
                        "$videoDetails.like", 
                        0
                    ],
                },
                videoIsPublished: {
                    $arrayElemAt: [
                        "$videoDetails.isPublished",
                        0,
                    ],
                },
                videoViews: {
                    $arrayElemAt: [
                        "$videoDetails.views",
                        0,
                    ],
                },
            },
        },
        {
            $project: {
                videoTitle: 1,
                videoDescription: 1,
                videoThumbnail: 1,
                videoFile: 1,
                videoOwner: 1,
                videoDuration: 1,
                videoLike: 1,
                videoIsPublished: 1,
                videoViews: 1,
            },
        },
    ]);

    if (!getLikedVideos) {
        throw new ApiError(400, "unable to fetched liked videos by user");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, getLikedVideos, "fetched liked videos successfully"));
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}