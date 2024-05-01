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
})

export { createTweet }