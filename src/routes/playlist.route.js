import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
const playlistrouter = Router();

playlistrouter.route("/createPlaylist").post(verifyJwt, createPlaylist)
playlistrouter.route("/addVideoToPlaylist").post(verifyJwt,addVideoToPlaylist)
playlistrouter.route("/getPlaylistById/:playlistId").post(verifyJwt,getPlaylistById)
playlistrouter.route("/getUserPlaylists/:userId").post(verifyJwt,getUserPlaylists)
playlistrouter.route("/removeVideoFromPlaylist/:videoId/:playlistId").post(verifyJwt,removeVideoFromPlaylist)
playlistrouter.route("/deletePlaylist/:playlistId").post(verifyJwt,deletePlaylist)
playlistrouter.route("/updatePlaylist/:playlistId").post(verifyJwt,updatePlaylist)

export default playlistrouter;
