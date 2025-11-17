import mongoose from "mongoose";
const { Schema, model } = mongoose;

const likeSchema = new Schema({}, { timestamps: true });

export const Like = model("Like", likeSchema);
