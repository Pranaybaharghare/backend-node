import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    const { userName, fullName, email, password } = req.body;
    // console.log(req);

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
        throw new ApiError(400, "avatar not upload on cloudinary")
    }

    if (!coverImage) {
        throw new ApiError(400, "cover image not upload on cloudinary")
    }

    const user = await User.create({
        userName,
        fullName,
        email,
        password,
        cover: coverImage?.url || "",
        avatar: avatar?.url || ""
    })

    const createdUser = await User.findById(user._id).select(
        " -password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(400, "something went wrong while creating user");
    }

    res.status(200)
    res.json(
        new ApiResponse(200, createdUser, "user created successfully")
    )


});

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return ({ accessToken, refreshToken });
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token");
    }

}

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
console.log(password);

    if (!email) {
        throw new ApiError(400, "email is required");
    }
    const existedUser = await User.findOne({
        $or: [{ email }]
    })

    if (!existedUser) {
        throw new ApiError(400, "user not found");
    }

    const ispasswordValid = await existedUser.checkPassword(password);
    if (!ispasswordValid) {
        throw new ApiError(400, "password is wrong");
    }

    const{refreshToken,accessToken} = generateAccessTokenAndRefreshToken(existedUser._id);
    const options = {
        httpOnly: true,
        secure: true
    }
    const userResponse ={
        _id:existedUser._id,
        _userName:existedUser.userName,
        email:existedUser.email
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse( 200,{
        user: userResponse, accessToken, refreshToken
    },"login successfull"))
})

export { registerUser, loginUser };