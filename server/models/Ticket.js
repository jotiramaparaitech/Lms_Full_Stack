import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Clerk user ID (same as User._id)
      required: true,
      ref: "User",
      index: true, // 🔥 faster user-based queries
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    query: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000, // 🔐 avoid huge payload abuse
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "solved"],
      default: "open",
    },

    repliedBy: {
      type: String, // admin / educator Clerk ID
      ref: "User",
      default: null,
    },

    reply: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// 🔹 Helpful index for admin dashboards
ticketSchema.index({ status: 1, createdAt: -1 });

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
