import mongoose from "mongoose";
const { Schema, model } = mongoose;

const tweetSchema = new Schema({}, { timestamps: true });

export const Tweet = model("Tweet", tweetSchema);
