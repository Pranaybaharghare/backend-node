import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    const { userName, fullName, email, password } = req.body;


    if ([userName, fullName, email, password].some((field) => {
        field.trim() === ""
    })) {
        throw new ApiError(400, "all fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existedUser) {
        throw new ApiError(401, "user existed");
    }

    const avatarLocalPath = req.files;
    const coverImageLocalPath = req.files
    // console.log(avatarLocalPath);
    // console.log(coverImageLocalPath);

    console.log("avatarLocalPath:", avatarLocalPath);
  console.log("coverImageLocalPath:", coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is not uploaded on server");
  }

  if (!coverImageLocalPath) {
    console.log("coverImage was not uploaded"); 
  }


    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    // console.log(avatar);
    // console.log(coverImage);
    if (avatar) {
        throw new ApiError(400, "avatar not upload on cloudinary")
    }

    if (coverImage) {
        throw new ApiError(400, "cover image not upload on cloudinary")
    }

    const user = await User.create({
        userName,
        fullName,
        avatar: avatar.url,
        email,
        password,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select(
        " -password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(400, "something went wrong while creating user");
    }

    res.status(200), json(
        new ApiResponse(200, createdUser, "user created successfully")
    )


});

export { registerUser };