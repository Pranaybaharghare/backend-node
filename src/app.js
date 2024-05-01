import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(express.static("public"))
app.use(cookieParser()) 


// route imports
import userRouter from "./routes/users.route.js";
import videoRouter from "./routes/video.route.js"
import subscriptionRouter from "./routes/subscription.route.js"
import likeRouter from "./routes/like.route.js";
import commentRouter from "./routes/comment.route.js";
import tweetRouter from "./routes/tweet.route.js";

// route declaration
app.use("/api/user",userRouter);
app.use("/api/video",videoRouter);
app.use("/api/subscription",subscriptionRouter)
app.use("/api/like",likeRouter)
app.use("/api/comment",commentRouter)
app.use("/api/tweet",tweetRouter)

export default app;