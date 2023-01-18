import mongoose, { model } from "mongoose";

const { Schema } = mongoose;

const blogsSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, required: true },
      unit: { type: String, required: true },
    },
    author: {
      name: { type: String, required: true },
      avatar: { type: String, required: false },
    },
    content: { type: String, required: true },
    comments: [{ comment: String }],
  },
  { timestamps: true }
);

export default model("Blog", blogsSchema);
