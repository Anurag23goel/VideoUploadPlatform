import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating acess and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // STEP-1 : get user details from frontend
  const { fullname, username, email, password } = req.body;

  // STEP-2 : validate details - check for empty
  if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
    return res.status(400).json(new ApiError(400, "All fields are required"));
  }

  // STEP-3 : check if user already exists - username, email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // STEP-4 : check for avatar image
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  let coverImageLocalPath = null;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // STEP-5 : upload avatar image on Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.log(avatar);
  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }
  const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

  // STEP-6 : create user in database
  const newUser = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
    email,
    username: username.toLowerCase(),
  });

  // STEP-7 : remove password and refresh token from response
  const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

  // STEP-8 : check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  // STEP-9 : return response
  return res.status(201).json(new ApiResponse(201, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // request data from body
  const { username, email, password } = req.body;
  if (!username || !email) {
    throw new ApiError(400, "Username or Email is required");
  }

  // validate data(check for blank spaces)

  // check data from database (based on username or email)
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  //if user doesnt exists
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // if user exists - access and refresh token send to user
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password Incorrect");
  }

  // send access and refresh token as cookies
  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
  .status(200)
  .cookie('accessToken', accessToken, options)
  .cookie('refreshToken', refreshToken, options)
  .json( new ApiResponse(200,
    {
      user: loggedInUser, accessToken, refreshToken
    },
    'User logged in successfully'
  ))

});

const logoutUser = asyncHandler(async(req, res) => {

  //Step 1: clear cookies
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )
  
  //Step 2: clear refresh token from database
  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
  .status(200)
  .clearCookie('accessToken', options)
  .clearCookie('refreshToken', options)
  .json(new ApiResponse(200, {}, "User logged out"))

});

export { registerUser, loginUser, logoutUser };
