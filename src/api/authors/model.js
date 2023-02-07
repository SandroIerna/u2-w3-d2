import mongoose, { model } from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const authorSchema = new Schema(
  {
    name: { type: String, required: true },
    avatar: { type: String, required: false },
    blogPosts: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
    password: { type: String, required: true },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
  },
  { timestamps: true }
);

authorSchema.pre("save", async function (next) {
  const currentAuthor = this;
  if (currentAuthor.isModified("password")) {
    const plainPW = currentAuthor.password;
    const hash = await bcrypt.hash(plainPW, 11);
    currentAuthor.password = hash;
  }
  next();
});

authorSchema.methods.toJSON = function () {
  const authorDocument = this;
  const author = authorDocument.toObject();

  delete author.password;
  delete author.createdAt;
  delete author.updatedAt;
  delete author.__v;
  return author;
};

authorSchema.static("checkCredentials", async function (email, password) {
  const author = await this.findOne({ email });
  if (author) {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      return author;
    } else {
      return null;
    }
  } else {
    return null;
  }
});

export default model("Author", authorSchema);
