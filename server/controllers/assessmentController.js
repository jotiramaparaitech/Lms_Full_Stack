import axios from "axios";
import { TestResult } from "../models/TestResult.js";
import { ensureUserExists } from "./userController.js"; 

/**
 * @desc    Generate AI Questions (Using Direct API Call)
 * @route   POST /api/assessment/generate
 * @access  Protected (Clerk)
 */
export const generateTest = async (req, res) => {
  try {
    const auth = req.auth();
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { domain, topic } = req.body;

    if (!domain || !topic) {
      return res.status(400).json({ success: false, message: "Domain and Topic are required" });
    }

    // --- PROMPT ENGINEERING ---
    const prompt = `
      You are an expert technical interviewer. Create 10 multiple choice questions (MCQ) on:
      Domain: "${domain}"
      Topic: "${topic}"
      Difficulty: Medium

      STRICT OUTPUT RULES:
      1. Output ONLY a valid JSON array.
      2. No Markdown formatting (no \`\`\`json).
      3. No conversational text.
      4. Format:
      [
        {
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Exact text of the correct option"
        }
      ]
    `;

    // --- DIRECT API CALL ---
    const apiKey = process.env.GEMINI_API_KEY;
    
    // ✅ FIX: Use 'gemini-flash-latest' which is optimized for the Free Tier
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const response = await axios.post(url, {
      contents: [{
        parts: [{ text: prompt }]
      }]
    });

    // Extract Text from API Response
    // Safety check: sometimes the API returns a slightly different structure if safety filters trigger
    if (!response.data.candidates || !response.data.candidates[0].content) {
        throw new Error("AI did not return content (possibly safety blocked). Try a different topic.");
    }

    const text = response.data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();

    // Parse JSON
    let questions;
    try {
      questions = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ success: false, message: "AI generated invalid format. Please try again." });
    }

    res.status(200).json({
      success: true,
      data: questions,
    });

  } catch (error) {
    // Enhanced Error Logging
    console.error("Generate Test Error Details:", error.response ? error.response.data : error.message);
    
    res.status(500).json({
      success: false,
      message: "Server error during test generation. Please check API Key.",
    });
  }
};

/**
 * @desc    Submit Test & Save Results
 * @route   POST /api/assessment/submit
 * @access  Protected (Clerk)
 */
export const submitTest = async (req, res) => {
  try {
    const auth = req.auth();
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await ensureUserExists(clerkUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { domain, topic, questionsData } = req.body;

    if (!questionsData || !Array.isArray(questionsData)) {
      return res.status(400).json({ success: false, message: "Invalid submission data" });
    }

    let correctCount = 0;
    
    const processedAnswers = questionsData.map((q) => {
      const isCorrect = q.selectedOption === q.correctOption;
      if (isCorrect) correctCount++;
      
      return {
        questionText: q.questionText,
        selectedOption: q.selectedOption,
        correctOption: q.correctOption,
        isCorrect
      };
    });

    const total = questionsData.length;
    const percentage = total > 0 ? (correctCount / total) * 100 : 0;

    const testResult = await TestResult.create({
      studentId: clerkUserId,
      studentEmail: user.email,
      domain,
      topic,
      score: correctCount,
      totalQuestions: total,
      percentage: parseFloat(percentage.toFixed(2)),
      answers: processedAnswers
    });

    res.status(201).json({
      success: true,
      message: "Test submitted successfully",
      score: correctCount,
      total,
      percentage: percentage.toFixed(2),
      resultId: testResult._id
    });

  } catch (error) {
    console.error("Submit Test Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during submission",
    });
  }
};

/**
 * @desc    Get Student's History
 * @route   GET /api/assessment/history
 * @access  Protected
 */
export const getHistory = async (req, res) => {
  try {
    const auth = req.auth();
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const history = await TestResult.find({ studentId: clerkUserId })
      .sort({ attemptDate: -1 });

    res.status(200).json({
      success: true,
      history,
    });

  } catch (error) {
    console.error("Get History Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};