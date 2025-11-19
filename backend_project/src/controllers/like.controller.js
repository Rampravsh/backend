import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const likeCriteria = { video: videoId, likedBy: req.user?._id };

  const likedVideo = await Like.findOne(likeCriteria);

  if (likedVideo) {
    await Like.deleteOne(likeCriteria);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Video unliked successfully")
      );
  } else {
    const newLike = await Like.create(likeCriteria);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { newLike, isLiked: true },
          "Video liked successfully"
        )
      );
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const likeCriteria = { comment: commentId, likedBy: req.user?._id };

  const likedComment = await Like.findOne(likeCriteria);

  if (likedComment) {
    await Like.deleteOne(likeCriteria);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isLiked: false },
          "Comment unliked successfully "
        )
      );
  } else {
    const newLike = await Like.create(likeCriteria);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { newLike, isLiked: true },
          "Comment liked successfully"
        )
      );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
