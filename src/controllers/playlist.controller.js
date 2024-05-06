import mongoose, { mongo } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(404, "name not found");
  }
  if (!description) {
    throw new ApiError(404, "description not found");
  }

  const newPlaylist = await Playlist.create({
    name: name,
    description: description,
    owner: req.user?._id,
  });

  if (!newPlaylist) {
    throw new ApiError(400, "unable to create new playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, newPlaylist, "new playlist created successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.body;
  if (!playlistId) {
    throw new ApiError(404, "playlistId not found");
  }
  if (!videoId) {
    throw new ApiError(404, "videoId not found");
  }
  const videoalreadyInPlaylist = await Playlist.find({
    _id: playlistId,
    videos: videoId,
  });
  if (videoalreadyInPlaylist.length > 0) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          videoalreadyInPlaylist,
          "video already present in playlist"
        )
      );
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(400, "playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "video added to playlist successfully"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(404, "playlistId not found");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $project: {
        videoDetails: 1,
        name: 1,
        description: 1,
        owner: 1,
        updatedAt: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!playlist) {
    throw new ApiError(400, "unable to fetched playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "fetched playlist successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(404, "userId not found");
  }

  const userPlaylist = await Playlist.find({ owner: userId });
  if (!userPlaylist) {
    throw new ApiError(400, "user playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylist, "fetched user playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!videoId) {
    throw new ApiError(404, "videoId not found");
  }
  if (!playlistId) {
    throw new ApiError(404, "playlistId not found");
  }
  const playlist = await Playlist.findById(playlistId);
  const playlistOwner = new mongoose.Types.ObjectId(playlist?.owner);
  let deleteVideoFromPlaylist;
  if (playlistOwner.toString() === req.user?._id.toString()) {
    deleteVideoFromPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pull: {
          videos: videoId,
        },
      },
      {
        new: true,
      }
    );
  }
  if (!deleteVideoFromPlaylist) {
    throw new ApiError(400, "unable to delete video from playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deleteVideoFromPlaylist,
        "video deleted from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(404, "playlistId not found");
  }

  const deletedPlaylist = await Playlist.deleteOne({ _id: playlistId });

  if (!deletedPlaylist) {
    throw new ApiError(400, "unable to delete playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!playlistId) {
    throw new ApiError(404, "playlistId not found");
  }
  if (!name && !description) {
    throw new ApiError(404, "name or description not found");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedPlaylist) {
    throw new ApiError(400, "unable to update playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "playlist updated successfully")
    );
});

export {
  createPlaylist,
  addVideoToPlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
