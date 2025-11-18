import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const pipeline = [];

  // Match stage for filtering
  const matchStage = {};
  if (query) {
    // Searching in title and description for the query
    matchStage.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userId");
    }
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  // Only add the match stage if there are any criteria
  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  // Sort stage
  const sortStage = {};
  if (sortBy && sortType) {
    sortStage[sortBy] = sortType === "desc" ? -1 : 1;
    pipeline.push({ $sort: sortStage });
  } else {
    // Default sort by creation date
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const videoAggregation = Video.aggregate(pipeline);

  const videos = await Video.aggregatePaginate(videoAggregation, options);

  if (!videos || videos.docs.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No videos found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || title.trim() === "") {
    throw new ApiError(400, "title missing");
  }
  if (!description || description.trim() === "") {
    throw new ApiError(400, "description missing");
  }
  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "videoFileLocalpath is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnailLocalPath is required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile) {
    throw new ApiError(400, "Error while uploading video on Cloudinary");
  }
  if (!thumbnail) {
    throw new ApiError(400, "Error while uploading thumbnail on Cloudinary");
  }

  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized. User not logged in.");
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: videoFile.duration,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(
      500,
      "Something went wrong when uploading the video on MongoDB"
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (title) {
    video.title = title;
  }

  if (description) {
    video.description = description;
  }

  if (thumbnailLocalPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) {
      throw new ApiError(500, "Error while uploading thumbnail on Cloudinary");
    }
    video.thumbnail = thumbnail.url;
  }

  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Publish status toggled successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
