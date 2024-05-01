import mongoose from "mongoose";
import { subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    //channelId is equal to userId because if we click on channel that channel also a one user only
    const {channelId} = req.params;
    if(!channelId){
        throw new ApiError(404, "channelId or userId not found");
    }

     const isSubscribed = await subscription.findOne({channel:channelId,subscriber:new mongoose.Types.ObjectId(req.user?._id)});
console.log(isSubscribed);

    // User.aggregate([
    //     {
    //         $match:{
    //             _id:channelId
    //         }
    //     },
    //     {
    //         $lookup: {
    //           from: "subscriptions",
    //           localField: "_id",
    //           foreignField: "channel",
    //           as: "subscribers"
    //         }
    //     },
    //     {
    //         $addFields:{
    //             isSubscribed:{
    //                 $cond:{
    //                     if:{$in:[req.user?._id,"$subscribers.subscriber"]},
    //                     then:true,
    //                     else:false
    //                 }
    //             }
    //         }
    //     }
    // ])

})

export {toggleSubscription,
}