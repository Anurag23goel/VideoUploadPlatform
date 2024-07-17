import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: "dmtrwrxni",
  api_key: "421679977635784",
  api_secret: "ZM2qsWwa-eRKO6teUPLkJsJWNeU",
  secure: true,
});

const extractPublicId = (url) => {
  const parts = url.split('/');
  const publicIdWithExtension = parts.pop().split('.')[0];
  const folder = parts.slice(parts.length - 2).join('/');
  return `${folder}/${publicIdWithExtension}`;
};

const uploadOnCloudinary = async function (localFilePath) {
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    // console.log(response);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //removes the file from server if upload on cloudinary gets failed
    return null;
  }
};

const deleteFromCloudinary = async function (url) {
  try {
    const publicId = extractPublicId(url);
    const response = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: "image",
      type: 'authenticated'
    });
    if (response.result !== 'ok' && response.result !== 'not found') {
      throw new ApiError(400, 'Error deleting file from Cloudinary');
    }
    return response;
  } catch (error) {
    throw new ApiError(400, error?.message);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary};
