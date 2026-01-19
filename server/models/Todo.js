import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Clerk userId

    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // ✅ New fields for your UI
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    category: { type: String, default: "personal" },

    isFavorite: { type: Boolean, default: false },

    isCompleted: { type: Boolean, default: false },

    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

const Todo = mongoose.model("Todo", todoSchema);
export default Todo;
