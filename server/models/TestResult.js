import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema({
  studentId: { 
    type: String, 
    required: true, 
    ref: "User", 
    index: true 
  }, 
  
  studentEmail: { type: String, required: true }, 
  
  domain: { type: String, required: true },      
  topic: { type: String, required: true },       

  difficulty: { 
    type: String, 
    enum: ["basic", "medium", "hard"], 
    required: true   // ❗ important
  },

  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },

  answers: [{
    questionText: { type: String, required: true },
    selectedOption: { type: String, required: true },
    correctOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  }],

  attemptDate: { type: Date, default: Date.now }
});


export const TestResult = mongoose.model("TestResult", testResultSchema);