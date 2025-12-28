import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadFile(localFilePath) {
  try {
    const response = await cloudinary.uploader.upload(localFilePath);
    return {
      success: true,
      message: "",
      data: response,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to upload file to cloud service.",
      data: null,
      error: error.message,
    };
  } finally {
    try {
      fs.unlinkSync(localFilePath);
    } catch (error) {
      return {
        success: false,
        message: "Failed to remove image file from local.",
        data: null,
        error: error.message,
      };
    }
  }
}

async function updateImage(newImageLocalFilePath, publicId) {
  try {
    const response = await cloudinary.uploader.upload(newImageLocalFilePath, {
      public_id: publicId,
      overwrite: true,
    });
    return {
      success: true,
      message: "",
      data: response,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to upload file to cloud service.",
      data: null,
      error: error.message,
    };
  } finally {
    try {
      fs.unlinkSync(newImageLocalFilePath);
    } catch (error) {
      return {
        success: false,
        message: "Failed to remove image file from local.",
        data: null,
        error: error.message,
      };
    }
  }
}

export { uploadFile, updateImage };
