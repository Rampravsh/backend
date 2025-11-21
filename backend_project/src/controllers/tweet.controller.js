import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });

  if (!tweet) {
    throw new ApiError(500, "Something went wrong while creating the tweet");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  const tweets = await Tweet.find({ owner: userId });

  if (!tweets) {
    // This case is unlikely with find, it will return []
    throw new ApiError(404, "Tweets not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this tweet");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: { content },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this tweet");
  }

  await Tweet.findByIdAndDelete(tweetId);
  await Like.deleteMany({ tweet: tweetId });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
