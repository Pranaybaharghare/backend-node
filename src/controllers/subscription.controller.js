import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    //channelId is equal to userId because if we click on channel that channel also a one user only
    const { channelId } = req.params;
    if (!channelId) {
        throw new ApiError(404, "channelId or userId not found");
    }

    const isSubscribed = await Subscription.findOne({ channel: new mongoose.Types.ObjectId(channelId), subscribedBy: new mongoose.Types.ObjectId(req.user?._id) });
    if (isSubscribed) {
        const deletedSubscriber = await Subscription.deleteOne({ channel: new mongoose.Types.ObjectId(channelId), subscribedBy: new mongoose.Types.ObjectId(req.user?._id) });
        return res
            .status(200)
            .json(new ApiResponse(200, deletedSubscriber, "remove subscriber from channel successfully"));
    }

    const newSubscriber = await Subscription.create({
        channel: channelId,
        subscribedBy: req.user?._id
    });
    if (!newSubscriber) {
        throw new ApiError(400, "unable to save new subscriber");
    }


    return res
        .status(200)
        .json(new ApiResponse(200, newSubscriber, "subscriber add to channel successfully"))

})

const getChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!channelId) {
        throw new ApiError(404, "channelId not found");
    }

    const subscriberList = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscribedBy",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $addFields: {
                subscriberName: { $arrayElemAt: ["$subscriberDetails.userName", 0] },
                subscriberAvatar: { $arrayElemAt: ["$subscriberDetails.avatar", 0] },
                subscriberEmail: { $arrayElemAt: ["$subscriberDetails.email", 0] },
                channelUserName: { $arrayElemAt: ["$channelDetails.userName", 0] },
                channelEmail: { $arrayElemAt: ["$channelDetails.email", 0] },
                channelAvatar: { $arrayElemAt: ["$channelDetails.avatar", 0] }
            }
        },
        {
            $project: {
                subscriberName: 1,
                subscriberAvatar: 1,
                subscriberEmail: 1,
                channelUserName: 1,
                channelEmail: 1,
                channelAvatar: 1
            }
        }
    ]);

    if (!subscriberList) {
        throw new ApiError(400, "unable to fetched subscriber list of channel");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscriberList, "fetched all subscriber successfully"));
});

const getUserSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriberId = req.user?._id;  //subscriberId is equal to logged in user
    if (!subscriberId) {
        throw new ApiError(404, "subcriberId not found");
    }

    const channelList = await Subscription.aggregate([
        {
            $match: {
                subscribedBy: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "ChannelDetails"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscribedBy",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $addFields: {
                channelUserName: { $arrayElemAt: ["$ChannelDetails.userName", 0] },
                channelAvatar: { $arrayElemAt: ["$ChannelDetails.avatar", 0] },
                channelEmail: { $arrayElemAt: ["$ChannelDetails.email", 0] },
                subscriberUserName: { $arrayElemAt: ["$subscriberDetails.userName", 0] },
                subscriberAvatar: { $arrayElemAt: ["$subscriberDetails.avatar", 0] },
                subscriberEmail: { $arrayElemAt: ["$subscriberDetails.email", 0] },
            }
        },
        {
            $project: {
                channelUserName: 1,
                channelAvatar: 1,
                channelEmail: 1,
                subscriberUserName: 1,
                subscriberAvatar: 1,
                subscriberEmail: 1,
            },
        },
    ]);
    if (!channelList) {
        throw new ApiError(400, "unable to fetched channel list to ser or subscriber");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channelList, "fetched channel list successfully"));
})
export {
    toggleSubscription, getChannelSubscribers, getUserSubscribedChannels
}