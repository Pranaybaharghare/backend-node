import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import ApiError from './ApiError.js';
import * as dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath,
            { resource_type: "auto" })
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); //remove locally saved temp file from the server if it failed to upload on cloudinary  
        console.error("Error uploading to Cloudinary. API Key:", error);
        throw new ApiError(400, "Failed to upload on Cloudinary");

    }

}

const deleteFromCloudinary = async (url) => {
    try {
        if (!url) return null;
        const publicId = url.split('/').pop().split('.')[0];
        const response = await cloudinary.uploader.destroy(publicId);
        console.log(`Image ${publicId} deleted from Cloudinary`);
        return response;
    } catch (error) {

    }
}
export { uploadOnCloudinary, deleteFromCloudinary };
