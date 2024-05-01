import { Comment } from "../models/comment.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const addComment = asyncHandler(async (req, res) => {
  const{videoId} = req.params;
  const{content} = req.body;
  if(!videoId){
    throw new ApiError(404,"videoId not found");
  }
  if(!content){
    throw new ApiError(404,"content not found");
  }

    const comment = await Comment.create({
    content:content,
    video:videoId,
    owner:req.user?._id
   })  
   if(!comment){
    throw new ApiError(400,"comment unable to add")
   }

   return res
   .status(200)
   .json(new ApiResponse(200,comment,"comment added successfully"))
})

export {addComment}