import dotenv from "dotenv"; 
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path:'./.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT | 6500,()=>{
      console.log(`Server up and running on port ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("error occur in db connection",error);
})









/*
import express from "express";
const app = express();
( async()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("ERROR",(error)=>{
        console.log("ERROR",error);
        throw error;
       })

       app.listen(process.env.PORT,()=>{
        console.log(`server is up on ${process.env.PORT}`);
       })
    } catch (error) {
        console.log("ERROR:",error);
        throw error;
    }
})()
*/