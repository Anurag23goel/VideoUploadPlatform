import fs from "fs";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dmtrwrxni',
  api_key: '421679977635784',
  api_secret: 'ZM2qsWwa-eRKO6teUPLkJsJWNeU',
  secure: true,
});


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

export { uploadOnCloudinary };