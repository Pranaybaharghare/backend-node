import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!videoId) {
    throw new ApiError(404, "videoId not found");
  }
  if (!content) {
    throw new ApiError(404, "content not found");
  }

  const comment = await Comment.create({
    content: content,
    video: videoId,
    owner: req.user?._id,
  });
  if (!comment) {
    throw new ApiError(400, "comment unable to add");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!videoId) {
    throw new ApiError(404, "videoId not found");
  }
  if (!content) {
    throw new ApiError(404, "content not found");
  }

  const comment = await Comment.findOne({
    video: new mongoose.Types.ObjectId(videoId),
    owner: new mongoose.Types.ObjectId(req.user?._id),
  });

  if (!comment) {
    throw new ApiError(400, "comment is not found");
  }

  comment.content = content;
  const updatedComment = await comment.save({ validateBeforeSave: false });
  if (!updatedComment) {
    throw new ApiError(400, "unable to update the comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(404, "videoId not found");
  }

  const comment = await Comment.findOne({
    video: new mongoose.Types.ObjectId(videoId),
    owner: new mongoose.Types.ObjectId(req.user?._id),
  });

  if (!comment) {
    throw new ApiError(400, "comment not found");
  }

  const deletedComment = await Comment.deleteOne(comment?._id);
  if (!deletedComment.deletedCount) {
    throw new ApiError(400, "comment unable to delete");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deleteComment, "comment deleted successfully"));
});

const getAllCommentByVideoId = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) {
    throw new ApiError(404, "videoId not found");
  }
  if (!page && !limit) {
    throw new ApiError(404, "page and limit not found");
  }

  // const allComments = await Comment.find({
  //   video: new mongoose.Types.ObjectId(videoId),
  // });

  const allComments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails"
      },
    },
    {
      $addFields:{
        userName: { $arrayElemAt: ["$ownerDetails.userName", 0] },
        avatar: { $arrayElemAt: ["$ownerDetails.avatar", 0] },
        email: { $arrayElemAt: ["$ownerDetails.email", 0] }
      }
    },
    {
      $project: {
        content: 1,
        userName:1,
        email:1,
        avatar:1
      },
    },
  ]);
  if (!allComments) {
    throw new ApiError(400, "unable to find all comment");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, allComments, "fetched all comments successfully")
    );
});
export { addComment, updateComment, deleteComment, getAllCommentByVideoId };
