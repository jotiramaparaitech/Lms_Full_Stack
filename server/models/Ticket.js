import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Clerk user ID (same as User _id)
      required: true,
      ref: "User",
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    query: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "solved"],
      default: "open",
    },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
