import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist } from "../controllers/playlist.controller.js";
const playlistrouter = Router();

playlistrouter.route("/createPlaylist").post(verifyJwt, createPlaylist)
playlistrouter.route("/addVideoToPlaylist").post(verifyJwt,addVideoToPlaylist)
playlistrouter.route("/getPlaylistById/:playlistId").post(verifyJwt,getPlaylistById)
playlistrouter.route("/getUserPlaylists/:userId").post(verifyJwt,getUserPlaylists)
playlistrouter.route("/removeVideoFromPlaylist/:videoId/:playlistId").post(verifyJwt,removeVideoFromPlaylist)

export default playlistrouter;
