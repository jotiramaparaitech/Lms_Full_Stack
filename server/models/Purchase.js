import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
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
  },
  { timestamps: true }
);

export const Purchase = mongoose.model("Purchase", PurchaseSchema);
