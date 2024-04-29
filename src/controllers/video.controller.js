import { Video } from "../models/video.model.js";
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
const getAllVideos = asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortType } = req.query
    //TODO: get all videos based on query, sort, pagination
    if (!page && !limit && !query) {
        throw new ApiError(400, "page or limit or query is not found or passed");
    }
    // Video.find()
    let sortObject = {};
    if (sortBy) {
        sortObject.sortBy = sortBy;
    }
    if (sortType) {
        sortObject.sortType = sortType;
    }

    // const videos = await Video.find().sort(sortObject).limit(parseInt(limit));
    const videos = Video.aggregate([
        {
            $lookup:{
                from:"User",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[{
                    $project:{
                        _id:1,
                        fullName:1,
                        avatar:"$avatar.url",
                        userName:1
                    }
                }]
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        }
    ])
    videos
    return res
        .status(200)
        .json(200, new ApiResponse(200, videos.title, "fetched all videos successfully"))
})

export { getAllVideos }