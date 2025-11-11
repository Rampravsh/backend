import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

// Upload an image
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("file is uploaded on cloudinary", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

//🚧🚧🚧🚧 for the future use 🚧🚧🚧🚧🚧
// Optimize delivery by resizing and applying auto-format and auto-quality
/* const optimizeUrl = cloudinary.url("shoes", {
  fetch_format: "auto",
  quality: "auto",
  });

console.log(optimizeUrl); */

// Transform the image: auto-crop to square aspect_ratio
/* const autoCropUrl = cloudinary.url("shoes", {
  crop: "auto",
  gravity: "auto",
  width: 500,
  height: 500,
});

console.log(autoCropUrl); */

export { uploadOnCloudinary };
