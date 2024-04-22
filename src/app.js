import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "20kb" }))
app.use(express.urlencoded({ extended: true , limit:"20kb"}))
app.use(express.static("public"))
app.use(cookieParser()) 


// route imports
import userRouter from "./routes/users.route.js";


// route declaration
app.use("/api/user",userRouter);

export default app;