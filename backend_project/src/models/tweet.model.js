import mongoose from "mongoose";
const { Schema, model } = mongoose;

const tweetSchema = new Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

export const Tweet = model("Tweet", tweetSchema);
