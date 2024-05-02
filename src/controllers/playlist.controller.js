import { Playlist } from "../models/playlist.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body;

    if(!name){
        throw new ApiError(404,"name not found");
    }
    if(!description){
        throw new ApiError(404,"description not found");
    }

    const newPlaylist = await Playlist.create({
        name:name,
        description:description,
        owner:req.user?._id
    });

    if(!newPlaylist){
        throw new ApiError(400,"unable to create new playlist");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,newPlaylist,"new playlist created successfully"))
})