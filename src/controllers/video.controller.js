import { Video } from "../models/video.model.js";
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
const getAllVideos = asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortType } = req.query;

    // Parse limit and page to integer
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    if (!parsedLimit && !parsedPage) {
        throw new ApiError(400, "page or limit or query is not found or passed");
    }

    const videos = await Video.aggregate([
        {
          $match:{
            isPublished:true
          }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [{
                    $project: {
                        fullName: 1,
                        userName: 1,
                        avatar: 1,
                    }
                }]
            }
        },
        {
            $unwind: {
                path: "$ownerDetails"
            }
        },
        {
            $project: {
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                owner: "$ownerDetails",
                like: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
            }
        },
        {
            $sort: {
                [sortBy]: sortType === "desc" ? -1 : 1
            }
        },
        {
            $limit: parsedLimit
        }

    ]);
    return res
        .status(200)
        .json(new ApiResponse(200, videos, "fetched all videos successfully"))
})


const uploadVideo = asyncHandler(async (req, res) => {
    let videoLocalPath;
    let thumbanailLocalPath;
    if (req.files && Array.isArray(req.files?.videoFile)) {
        videoLocalPath = req.files.videoFile[0].path;
    }
    if (req.files && Array.isArray(req.files?.thumbnail)) {
        thumbanailLocalPath = req.files.thumbnail[0].path;
    }
    const { title, description } = req.body;
    if (!videoLocalPath && !thumbanailLocalPath) {
        throw new ApiError(404, "files not found");
    }
    if (!title && !description) {
        throw new ApiError(404, "title and description not found");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbanailLocalPath);
    if (!videoFile) {
        throw new ApiError(404, "video not upload on cloudinary");
    }
    if (!thumbnail) {
        throw new ApiError(404, "thumbnail not upload on cloudinary");
    }
    const duration = videoFile?.duration.toFixed(2);
    const uploadVideo = await Video.create({
        title: req.body?.title,
        description: req.body?.description || "",
        videoFile: videoFile?.url || "",
        thumbnail: thumbnail?.url || "",
        owner: req.user?._id,
        duration: duration
    })
    return res
        .status(200)
        .json(new ApiResponse(200, uploadVideo, "video upload successfully"))
})


const getVideosByUserId = asyncHandler(async (req, res) => {
    const { userId, userName } = req.params;
    if (!userName && !userId) {
        throw new ApiError(404, "user not found");
    }
    const user = await User.find({ userName: userName }).select("-refreshToken -password")

    const videosByUserId = await Video.find(user?._id);
    return res
        .status(200)
        .json(new ApiResponse(200, videosByUserId, "fetched videos by userId successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!videoId) {
        throw new ApiError(404, "videoId not found");
    }

    const video = await Video.findById(videoId);
    return res
        .status(200)
        .json(new ApiResponse(200, video, "fetched video successfully"))
})

const updateVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    let updatedThumbnailLocalPath;
    let updatedThumbnail;
    if (!videoId) {
        throw new ApiError(400, "videoId not found");
    }
    if (!title && !description) {
        throw new ApiError(400, "title or description not found");
    }
    if (req.files && Array.isArray(req.files?.thumbnail)) {
        updatedThumbnailLocalPath = req.files.thumbnail[0].path;
    }
    if (updatedThumbnailLocalPath) {
        updatedThumbnail = await uploadOnCloudinary(updatedThumbnailLocalPath);
    }

    const video = await Video.findById(videoId);
    if (!video[0]?.owner === req.user?._id) {
        throw new ApiError(400, "no access to update the video details");
    }
    if (updatedThumbnail) {
        await deleteFromCloudinary(video?.thumbnail);

    }

    const updatedVideoDetails = await Video.findByIdAndUpdate(videoId, {
        $set: {
            title: title || "",
            description: description || "",
            thumbnail: updatedThumbnail?.url || ""
        }
    }, {
        new: true
    })

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideoDetails, "video details updated successfully"))
})

const deleteVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(404, "videoId not found");
    }
    const video = await Video.find(new mongoose.Types.ObjectId(videoId));
    await deleteFromCloudinary(video[0]?.videoFile);
    await deleteFromCloudinary(video[0]?.thumbnail);
    const deletedVideo = await Video.deleteOne(new mongoose.Types.ObjectId(videoId));

    return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "video deleted successfully"));

})


const publishVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(404,"video id not found");
    }
   const uploadedVideo = await Video.findById(videoId);
   if(!uploadedVideo[0]?.owner === req?.user._id){
       throw new ApiError(400,"not access to publish video");
   }
   if(uploadedVideo?.isPublished === false){
    uploadedVideo.isPublished =true;
   }

  const publishedVideo = await uploadedVideo.save({validateBeforeSave: false})
  
   return res
   .status(200)
   .json(new ApiResponse(200,publishedVideo,"video published successfully"))
})

export {
    getAllVideos,
    uploadVideo,
    getVideosByUserId,
    getVideoById,
    updateVideoDetails,
    deleteVideoById,
    publishVideo
}