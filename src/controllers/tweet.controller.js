import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (!content) {
        throw new ApiError(404, "content not found");
    }
    const tweet = await Tweet.create({
        content: content,
        owner: req.user?._id
    })
    if (!tweet) {
        throw new ApiError(400, "unable to create tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "tweet added successfully"))
});

const getUserTweets = asyncHandler(async (req, res) => {
    const{ userId } = req.params;
    if (!userId) {
        throw new ApiError(404, "userId not found");
    }
    const userTweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "userDetails",
                pipeline: [
                    {
                        $project: {
                            userName: 1,
                            fullName: 1,
                            avatar: 1,
                            email: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                userName: {
                    $arrayElemAt: [
                        "$userDetails.userName",
                        0,
                    ],
                },
                userFullName: {
                    $arrayElemAt: [
                        "$userDetails.fullName",
                        0,
                    ],
                },
                userEmail: {
                    $arrayElemAt: ["$userDetails.email", 0],
                },
                userAvatar: {
                    $arrayElemAt: [
                        "$userDetails.avatar",
                        0,
                    ],
                },
            },
        },
        {
            $project: {
                content: 1,
                tweetLike: 1,
                userName: 1,
                userFullName: 1,
                userEmail: 1,
                userAvatar: 1,
            },
        },
    ])
    return res
        .status(200)
        .json(new ApiResponse(200, userTweets, "fetched user tweets successfully"))
});

const deleteTweet = asyncHandler(async (req, res) => {
    const{tweetId} = req.body;
    const owner = req.user?._id;
    if(!tweetId){
        throw new ApiError(404,"tweetId not found");
    }
    if(!owner){
        throw new ApiError(400,"owner not found");
    }

    const deletedTweet = await Tweet.deleteOne({_id:tweetId,owner:owner});
    if(!deleteTweet){
        throw new ApiError(400,"unable to delete tweet");
    }
    return res
    .status(200)
    .json(new ApiResponse(200,deletedTweet,"tweet deleted successfully"));
})

export { createTweet, getUserTweets, deleteTweet }