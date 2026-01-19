import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema({
  // Link to your existing User
  studentId: { 
    type: String, 
    required: true, 
    ref: "User", 
    index: true 
  }, 
  
  studentEmail: { type: String, required: true }, 
  
  domain: { type: String, required: true },      
  topic: { type: String, required: true },       
  difficulty: { type: String, default: "Medium" }, 
  
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },

  // Snapshot of the Q&A
  answers: [{
    questionText: { type: String, required: true },
    selectedOption: { type: String, required: true },
    correctOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  }],

  attemptDate: { type: Date, default: Date.now }
});

export const TestResult = mongoose.model("TestResult", testResultSchema);