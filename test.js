const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path
  
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
  
    //TODO: delete old image - assignment
  
    const avatar = await uploadOnCloudinary(avatarLocalPath)
  
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }
  
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")
  
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
  })




  const updateAvatarUrl = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    console.log(avatarLocalPath);
  
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar File Missing");
    }
  
    const avatar = await uploadOnCloudinary(avatarLocalPath);
  
    if (!avatar.url) {
      throw new ApiError(400, "Error while uploading on Cloudinary");
    }
  
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: avatar.url,
        },
      },
      { new: true }
    );
  
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    return res.status(200).json(new ApiResponse(200, { newAvatarURL: user.avatar }, "Avatar Updated Successfully"));
  });