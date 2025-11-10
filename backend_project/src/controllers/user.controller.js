import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const createdUser = { id: 1, username: "testuser" };
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));

  //   res.status(200).json({
  //     message: "ok",
  //   });
});

export { registerUser };
