import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PlaylistSchema = new Schema({}, { timestamps: true });

export const Playlist = model("Playlist", PlaylistSchema);
