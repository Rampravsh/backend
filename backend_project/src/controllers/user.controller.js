import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation - not empty
  //check if user already exists :username ,email
  //check for images,cheadk for avatar
  //upload them to cloudinary, avatar
  //create user object- create entry in db
  //remove password and refresh token field from response
  //check for user creation
  // return response

  const { fullName, email, userName, password } = req.body;
  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are reauired");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or userName already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // console.log("\n for checking start \n ");
  // console.log("req.files:", req.files);
  // console.log("avatarLocalPath:", avatarLocalPath);
  // console.log("coverImageLocalPath:", coverImageLocalPath);
  // console.log("\n for checking end\n ");

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatarLocalPath is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // console.log("for checking createdUser :", createdUser);

  if (!createdUser) {
    throw new ApiError(500, "something went wrong when registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body se data nikalna
  //dekho data empty to nahi hai
  //agar empty ho to error throw karo
  //email aur password se database me check karo
  //agar database email ya pasword same na mile to error throw karo
  //aur database me same user mile to refresh token aur access token genrete karo
  //aur end me user detials ko return karo

  // console.log(req);

  const { email, userName, password } = req.body;

  // console.log(email, userName, password);

  //yaha pe hum sirf email or userName dono me se koe ek v check kar sakte hai
  //password ko bad me check kar sakte hai 😂

  if ([email, userName, password].some((field) => field.trim() === "")) {
    throw new ApiError(400, "all fields are reauired");
  }
  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });
  // console.log("checking for existedUser \n", existedUser, "\n");

  if (!existedUser) {
    throw new ApiError(401, "user with this not found");
  }

  const isPasswordValid = await existedUser.isPasswordValid(password);
  // console.log(isPasswordValid);

  if (!isPasswordValid) {
    throw new ApiError(401, "password sahi nahi hai 🤬");
  }

  const accessToken = await existedUser.generateAccessToken();
  const refreshToken = await existedUser.generateRefreshToken();
  // console.log(accessToken, refreshToken);

  if (refreshToken) {
    existedUser.refreshToken = refreshToken;
    await existedUser.save({ validateBeforeSave: false });
  }

  const loggedInUser = existedUser.toObject();
  delete loggedInUser.password;
  delete loggedInUser.refreshToken;

  const options = {
    httpOnly: true,
    // secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );

  // console.log("checking for loggedin user :", loggedInUser);
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(req.user._id, { refreshToken: null }).exec();

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  // console.log(refreshToken);

  if (!refreshToken) {
    throw new ApiError(401, "refresh token not found, login again");
  }

  const user = await User.findOne({ refreshToken });
  if (!user) {
    throw new ApiError(401, "invalid refresh token, login again");
  }
  const newAccessToken = await user.generateAccessToken();
  const newRefreshToken = await user.generateRefreshToken();

  const options = {
    httpOnly: true,
    // secure: true,
  };
  return res
    .status(200)
    .cookie("refreshToken", newRefreshToken, options)
    .cookie("accessToken", newAccessToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken: newAccessToken },
        "Access token refreshed successfully"
      )
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordValid = await user.isPasswordValid(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req, user, "current user  fetched successfully ");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "all fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { fullName, email } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account ditails updated successfully "));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(
      400,
      "coverImage file is missing when updating user coverImage"
    );
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage) {
    throw new ApiError(500, "something went wrong when uploading coverImage");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User coverImage updated successfully"));
});
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is missing when updating user Avatar");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, "something went wrong when uploading avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User avatar updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
