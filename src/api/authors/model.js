import mongoose, { model } from "mongoose";

const { Schema } = mongoose;

const authorSchema = new Schema(
  {
    name: { type: String, required: true },
    avatar: { type: String, required: false },
    blogPosts: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
  },
  { timestamps: true }
);

export default model("Author", authorSchema);
