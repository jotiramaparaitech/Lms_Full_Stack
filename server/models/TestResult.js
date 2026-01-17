import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema({
  // Link to your existing User (using String ID as per your schema)
  studentId: { type: String, required: true, ref: "User" }, 
  studentEmail: { type: String, required: true }, // For your email tracking
  
  domain: String,       // e.g. "React"
  topic: String,        // e.g. "Hooks"
  difficulty: String,
  
  score: Number,
  totalQuestions: Number,
  percentage: Number,

  // We snapshot the questions here since we aren't saving them to a bank
  answers: [{
    questionText: String,
    selectedOption: String,
    correctOption: String,
    isCorrect: Boolean
  }],

  attemptDate: { type: Date, default: Date.now }
});

export const TestResult = mongoose.model("TestResult", testResultSchema);