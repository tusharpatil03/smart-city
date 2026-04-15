import { v2 as cloudinary } from "cloudinary";
import { env } from "../shared/config/env";

// Configure cloudinary with environment variables
cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret
});

export const uploadImages = async (files: string[]): Promise<string[]> => {
  if (files.length === 0) {
    return [];
  }

  const uploadedUrls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const file = files[i];
      
      // file should be a data URL (base64-encoded image)
      const result = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
        folder: "smart-city-issues"
      });

      uploadedUrls.push(result.secure_url);
    } catch (error) {
      console.error(`Failed to upload image ${i + 1}:`, error);
      throw new Error(`Image upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return uploadedUrls;
};
