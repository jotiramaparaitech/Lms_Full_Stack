import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentId: {
      type: String,
      default: "manual-assignment", // ✅ For manual or Razorpay reference
    },
    // New Registration Fields
    fullName: { type: String },
    email: { type: String },
    phone: { type: String },
    college: { type: String },
    projectOpted: { type: String },
    monthOpted: { type: String },
    yearOfGraduation: { type: String },
    stream: { type: String },
    scholarshipId: { type: String },
    language: { type: String },
  },
  { timestamps: true }
);

export const Purchase = mongoose.model("Purchase", PurchaseSchema);
