import axios from "axios";
import { QuestionBank } from "../models/QuestionBank.js";
import { TestResult } from "../models/TestResult.js";
import User from "../models/User.js";

// --- HELPER: Normalize Input ---
const normalizeInput = (text) => {
  if (!text) return "";
  let clean = text.toLowerCase().trim().replace(/[^a-z0-9\s]/g, ""); 
  
  const aliasMap = {
    "js": "javascript",
    "py": "python",
    "reactjs": "react",
    "node": "nodejs",
    "c++": "cplusplus",
    "cpp": "cplusplus",
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "db": "database",
    "sql": "sql"
  };

  return aliasMap[clean] || clean;
};

/**
 * @desc    Generate Test (Universal Domain Strategy)
 * @route   POST /api/assessment/generate
 */
export const generateTest = async (req, res) => {
  try {
    const auth = req.auth();
    if (!auth?.userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    let { domain, topic, difficulty } = req.body;

    if (!domain) {
      return res.status(400).json({ success: false, message: "Domain is required (e.g., History, Physics, Coding)" });
    }
    
    // 1. SETUP VARIABLES
    // Default to "general assessment" if topic is missing, null, or empty string
    const rawTopic = topic || "General Assessment";
    
    const cleanDomain = normalizeInput(domain);
    const cleanTopic = normalizeInput(rawTopic);
    const cleanDifficulty = difficulty ? difficulty.toLowerCase() : "medium"; 
    
    // Check if we are in "General" mode
    const isGeneralAssessment = cleanTopic === "general assessment";

    // 2. CONSTRUCT DATABASE QUERY
    let query = { 
        domain: cleanDomain, 
        difficulty: cleanDifficulty 
    };

    // If NOT general, strict filter by topic. 
    // If General, we remove the topic filter to pull questions from ANY sub-topic in this domain.
    if (!isGeneralAssessment) {
        query.topic = cleanTopic;
    }

    // 3. CHECK DATABASE POOL
    const availableCount = await QuestionBank.countDocuments(query);
    let questionsToServe = [];

    // --- STRATEGY A: CACHE HIT ---
    if (availableCount >= 15) {
        console.log(`✅ Cache Hit: Serving from ${availableCount} existing questions.`);
        
        const randomQuestions = await QuestionBank.aggregate([
            { $match: query },
            { $sample: { size: 10 } }
        ]);
        questionsToServe = randomQuestions;
    } 
    
    // --- STRATEGY B: CACHE MISS (Call AI) ---
    else {
        console.log(`⚠️ Cache Miss (${availableCount}). Calling AI for ${cleanDomain}...`);

        // ➤ DYNAMIC PROMPT CONSTRUCTION
        let topicInstruction = "";
        
        if (isGeneralAssessment) {
            // General Mode: Ask for variety
            topicInstruction = `
            Context: The user wants a "General Assessment" on the domain "${cleanDomain}".
            Instruction: Generate questions covering A VARIETY of fundamental sub-topics within "${cleanDomain}". 
            (Example: If Domain is "Marketing", cover SEO, Branding, and Analytics. If "Biology", cover Cell Theory, Genetics, and Ecology).
            `;
        } else {
            // Specific Mode: Strict focus
            topicInstruction = `
            Context: The user wants a specific assessment on the topic: "${cleanTopic}" within the domain "${cleanDomain}".
            Instruction: Focus all questions strictly on "${cleanTopic}".
            `;
        }

        // Optimized Universal Prompt
        const prompt = `
          Act as a strict Subject Matter Expert and Examiner in the field of "${cleanDomain}".
          
          Generate 30 UNIQUE multiple-choice questions (MCQ).
          Difficulty Level: "${cleanDifficulty}"
          
          ${topicInstruction}

          STRICT OUTPUT RULES:
          1. If the Domain "${cleanDomain}" is nonsense, impossible, or illegible, return exactly: []
          2. Return ONLY a valid JSON Array.
          3. No Markdown, no code blocks, no intro text.
          4. JSON Format:
          [
            {
              "question": "Clear and concise question text",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "answer": "Option B" 
            }
          ]
          
          Constraint: Ensure the "answer" field matches one of the strings in "options" exactly.
        `;

        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        const response = await axios.post(url, {
            contents: [{ parts: [{ text: prompt }] }]
        });

        const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error("AI returned empty response");

        // Sanitize string to ensure JSON parsing works
        const jsonText = rawText.replace(/```json|```/g, '').trim();
        
        let newQuestions;
        try {
             newQuestions = JSON.parse(jsonText);
        } catch (parseError) {
             console.error("JSON Parse Error:", parseError);
             throw new Error("AI returned invalid JSON format");
        }

        // Handle "Nonsense" response (Empty Array)
        if (!Array.isArray(newQuestions) || newQuestions.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Unable to generate questions for domain: ${domain}. Please check spelling or try a valid field of study.` 
            });
        }

        // Prepare for DB
        // If it is a general assessment, we tag it with "general assessment" so we can easily retrieve mixed bags later
        const bankEntries = newQuestions.map(q => ({
            domain: cleanDomain,
            topic: isGeneralAssessment ? "general assessment" : cleanTopic, 
            difficulty: cleanDifficulty,
            questionText: q.question, 
            options: q.options,
            correctOption: q.answer
        }));

        // Insert into DB (ordered: false continues insert even if one fails)
        try {
            if (bankEntries.length > 0) {
                await QuestionBank.insertMany(bankEntries, { ordered: false });
            }
        } catch (e) {
            // Quietly handle duplicate key errors
        }

        questionsToServe = newQuestions.slice(0, 10);
    }

    // 4. FORMAT RESPONSE
    const formattedData = questionsToServe.map(q => ({
        question: q.questionText || q.question,
        options: q.options,
        answer: q.correctOption || q.answer
    }));

    res.status(200).json({
        success: true,
        data: formattedData,
    });

  } catch (error) {
    console.error("Generate Test Error:", error.message);
    res.status(500).json({ success: false, message: "Server busy or AI limit reached. Try again." });
  }
};

/**
 * @desc    Submit Test & Save Results
 * @route   POST /api/assessment/submit
 */
export const submitTest = async (req, res) => {
  try {
    const auth = req.auth();
    if (!auth?.userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findOne({ clerkId: auth.userId }); 
    const { domain, topic, difficulty, questionsData } = req.body;

    if (!questionsData || !Array.isArray(questionsData)) {
      return res.status(400).json({ success: false, message: "Invalid submission data" });
    }

    let correctCount = 0;
    
    // Calculate results and preserve the full question data for the frontend
    const processedAnswers = questionsData.map((q) => {
      const isCorrect = q.selectedOption === q.correctOption;
      if (isCorrect) correctCount++;
      return { 
          questionText: q.questionText,
          selectedOption: q.selectedOption,
          correctOption: q.correctOption,
          options: q.options || [], // <--- ✅ ADDED: Capture options from frontend
          isCorrect 
      };
    });

    const total = questionsData.length;
    const percentage = total > 0 ? (correctCount / total) * 100 : 0;
    const cleanDifficulty = difficulty?.toLowerCase();
    
    if (!["basic", "medium", "hard"].includes(cleanDifficulty)) {
        return res.status(400).json({ success: false, message: "Invalid difficulty level" });
      }

    const testResult = await TestResult.create({
      studentId: auth.userId,
      studentEmail: user?.email || "Unknown",
      domain,
      topic,
      difficulty: cleanDifficulty,
      score: correctCount,
      totalQuestions: total,
      percentage: parseFloat(percentage.toFixed(2)),
      answers: processedAnswers
    });

    res.status(201).json({
      success: true,
      message: "Test submitted",
      score: correctCount,
      total,
      percentage: percentage.toFixed(2),
      resultId: testResult._id,
      results: processedAnswers // <--- ADDED THIS LINE (Frontend needs it immediately)
    });

  } catch (error) {
    console.error("Submit Error:", error);
    res.status(500).json({ success: false, message: "Submission failed" });
  }
};


export const getHistory = async (req, res) => {
  try {
    const auth = req.auth();
    if (!auth?.userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Optimization: .select("-answers") excludes the heavy answers array
    const history = await TestResult.find({ studentId: auth.userId })
      .sort({ attemptDate: -1 })
      .select("-answers");

    res.status(200).json({ success: true, history });

  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({ success: false, message: "Error fetching history" });
  }
};



export const getStudentTests = async (req, res) => {
  try {
    const { studentId } = req.params;

    const tests = await TestResult.find({ studentId })
      .sort({ attemptDate: -1 })
      .select("percentage score totalQuestions domain topic difficulty attemptDate");

    res.status(200).json({
      success: true,
      tests
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch student tests" });
  }
};