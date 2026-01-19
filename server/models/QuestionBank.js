import mongoose from "mongoose";

const questionBankSchema = new mongoose.Schema({
  domain: { 
    type: String, 
    required: true, 
    index: true, 
    lowercase: true, 
    trim: true 
  }, 
  topic: { 
    type: String, 
    required: true, 
    index: true, 
    lowercase: true, 
    trim: true 
  },  
  difficulty: { 
    type: String, 
    enum: ["basic", "medium", "hard"], 
    required: true, 
    default: "medium" 
  },
  
  questionText: { type: String, required: true, unique: true }, 
  options: [{ type: String, required: true }], 
  correctOption: { type: String, required: true },
  
  // Auto-delete questions after 90 days to save space
  createdAt: { type: Date, default: Date.now, expires: '30d' } 
});

// Compound index for fast random sampling
questionBankSchema.index({ domain: 1, topic: 1, difficulty: 1 });

export const QuestionBank = mongoose.model("QuestionBank", questionBankSchema);