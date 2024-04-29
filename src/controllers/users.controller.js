import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const registerUser = asyncHandler(async (req, res) => {
  const { userName, fullName, email, password } = req.body;

  if (
    [userName, fullName, email, password].some((field) => {
      field.trim() === "";
    })
  ) {
    throw new ApiError(400, "all fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(401, "user existed");
  }
  let avatarLocalPath;
  let coverLocalPath;
  if (req.files && Array.isArray(req.files.avatar)) {
    avatarLocalPath = req.files.avatar[0].path;
  }
  if (req.files && Array.isArray(req.files.cover)) {
    coverLocalPath = req.files.cover[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is not uploaded on server");
  }

  if (!coverLocalPath) {
    throw new ApiError(400, "coverImage was not uploaded");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverLocalPath);

  if (!avatar) {
    throw new ApiError(400, "avatar not upload on cloudinary");
  }

  if (!coverImage) {
    throw new ApiError(400, "cover image not upload on cloudinary");
  }

  const user = await User.create({
    userName,
    fullName,
    email,
    password,
    cover: coverImage?.url || "",
    avatar: avatar?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    " -password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(400, "something went wrong while creating user");
  }

  res.status(200);
  res.json(new ApiResponse(200, createdUser, "user created successfully"));
});

const generateAccessTokenAndRefreshToken = async function (userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(
        400,
        "user not found for generating access and refresh token"
      );
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log("error at generateAccessTokenAndRefreshToken", error);
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required");
  }
  const existedUser = await User.findOne({
    $or: [{ email }],
  });

  if (!existedUser) {
    throw new ApiError(400, "user not found");
  }

  const ispasswordValid = await existedUser.checkPassword(password);
  if (!ispasswordValid) {
    throw new ApiError(400, "password is wrong");
  }

  const { refreshToken, accessToken } =
    await generateAccessTokenAndRefreshToken(existedUser._id);
  const options = {
    httpOnly: true,
    secure: true,
  };
  const userResponse = {
    _id: existedUser._id,
    userName: existedUser.userName,
    email: existedUser.email,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: userResponse,
          accessToken,
          refreshToken,
        },
        "login successful"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "logout successful"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(400, "refresh token not found from cookie");
    }
    const decodedIncomingToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!decodedIncomingToken) {
      throw new ApiError(400, "incoming refresh token not decode");
    }
    const user = await User.findById(decodedIncomingToken?._id);
    if (!user) {
      throw new ApiError(400, "user not found");
    }
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(400, "refresh token expired");
    }

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, user, "accessToken update successfully"));
  } catch (error) {
    throw new ApiError(400, "invalid refreshToken");
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(400, "user not logged in");
  }
  const result = await user.checkPassword(currentPassword);
  if (!result) {
    throw new ApiError(400, "current password is not matched");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "current user"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { email, fullName, userName } = req.body;
  if (!email && !fullName && !userName) {
    throw new ApiError(400, "email or password or username is not defined");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName: fullName,
        email: email,
        userName: userName,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "account details updated successfully")
    );
});

const updateAvatarOrCoverImage = asyncHandler(async (req, res) => {
  let avatarLocalPath;
  let coverLocalPath;
  if (req.files && Array.isArray(req.files.avatar)) {
    avatarLocalPath = req.files.avatar[0].path;
  }
  if (req.files && Array.isArray(req.files.cover)) {
    coverLocalPath = req.files.cover[0].path;
  }
  if (!avatarLocalPath && !coverLocalPath) {
    throw new ApiError(400, "avatar or cover is not uploaded on server");
  }
  let avatar = {};
  let coverImage = {};
  if (avatarLocalPath !== undefined) {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    await deleteFromCloudinary(req.user?.avatar);
  }
  if (coverLocalPath !== undefined) {
    coverImage = await uploadOnCloudinary(coverLocalPath);
    await deleteFromCloudinary(req.user?.cover);
  }
  if (!avatar && !coverImage) {
    throw new ApiError(400, "avatar or cover image not upload on cloudinary");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar?.url || undefined,
        cover: coverImage?.url || undefined,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser,
        "cover image or avatar is updated successfully"
      )
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;
  if (!userName?.trim()) {
    throw new ApiError(400, "username not found");
  }



  const channel = await User.aggregate([
    {
      $match: {
        userName: userName
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        subscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false

          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        cover: 1,
        avatar: 1,
        subscribedToCount: 1,
        subscribersCount: 1,
        userName: 1,
        isSubscribed: 1,
        email: 1
      }
    }
  ])

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "watch history fetched successfully"
      )
    );
});
export {
  registerUser,
  loginUser,
  logout,
  refreshAccessToken,
  updatePassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatarOrCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
