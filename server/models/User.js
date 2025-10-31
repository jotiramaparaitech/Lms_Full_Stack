import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // keep this if you’re using Clerk user IDs
    name: { type: String, required: true },
    email: { type: String, required: true },
    imageUrl: { type: String },
    role: {
      type: String,
      enum: ["student", "educator", "admin"],
      default: "student",
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
