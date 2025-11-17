import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const { Schema, model } = mongoose;

const commentSchema = new Schema({}, { timestamps: true });

commentSchema.plugin(mongooseAggregatePaginate);
export const Comment = model("Comment", commentSchema);
