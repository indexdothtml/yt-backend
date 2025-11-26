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
      data: response.url,
    };
  } catch (error) {
    try {
      fs.unlinkSync(localFilePath);
      return {
        success: true,
        message: "Failed to upload file to cloud service.",
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: "Deleting localfile opeartion failed.",
        data: null,
      };
    }
  } finally {
    fs.unlinkSync(localFilePath);
  }
}

export { uploadFile };
