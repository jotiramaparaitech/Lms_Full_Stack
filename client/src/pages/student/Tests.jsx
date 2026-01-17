import React, { useState, useContext, useEffect } from "react";
import StudentLayout from "../../components/student/StudentLayout"; // Keep your layout wrapper
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Tests = () => {
  const { backendUrl, getToken, userData } = useContext(AppContext);

  // --- STATES ---
  const [phase, setPhase] = useState("dashboard"); // dashboard | loading | testing | result
  const [history, setHistory] = useState([]); // Past test results
  const [topic, setTopic] = useState({ domain: "", subtopic: "" });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  // --- 1. FETCH HISTORY ON MOUNT ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await getToken();
        if(token){
            const { data } = await axios.get(`${backendUrl}/api/assessment/history`, {
            headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) setHistory(data.history);
        }
      } catch (error) {
        console.error("Failed to load history");
      }
    };
    fetchHistory();
  }, [backendUrl, getToken, phase]);

  // --- 2. GENERATE TEST ---
  const handleGenerate = async () => {
    if (!topic.domain || !topic.subtopic) return toast.error("Please fill all fields");
    
    setPhase("loading");
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/assessment/generate`,
        { domain: topic.domain, topic: topic.subtopic },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setQuestions(data.data);
      setPhase("testing");
    } catch (error) {
      toast.error("AI Generation Failed. Try again.");
      setPhase("dashboard");
    }
  };

  // --- 3. SUBMIT TEST ---
  const handleSubmit = async () => {
    const submissionData = questions.map((q, idx) => ({
      questionText: q.question,
      selectedOption: answers[idx] || "Skipped",
      correctOption: q.answer,
    }));

    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/assessment/submit`,
        {
          domain: topic.domain,
          topic: topic.subtopic,
          questionsData: submissionData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setResult(data);
      setPhase("result");
      toast.success("Test Submitted Successfully!");
    } catch (error) {
      toast.error("Submission Failed");
    }
  };

  // --- RENDER HELPERS ---
  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <StudentLayout>
      <div className="relative min-h-screen overflow-hidden p-2 sm:p-6">
        
        {/* --- Background Globs (Matching Enrollments Page) --- */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400/20 blur-[100px] rounded-full -z-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-400/20 blur-[120px] rounded-full -z-10 animate-pulse"></div>

        {/* --- Header --- */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 animate-text">
            AI Skill Assessment
          </h1>
          <p className="text-gray-500 mt-2">Test your knowledge with unique AI-generated questions.</p>
        </div>

        <AnimatePresence mode="wait">
          
          {/* ================= PHASE 1: DASHBOARD ================= */}
          {phase === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              
              {/* Left: Generator Card */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50 sticky top-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">⚡</span> New Test
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Domain / Technology</label>
                      <input 
                        className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g. React JS, Python, SQL"
                        value={topic.domain}
                        onChange={(e) => setTopic({...topic, domain: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Specific Topic</label>
                      <input 
                        className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g. Hooks, Pandas, Joins"
                        value={topic.subtopic}
                        onChange={(e) => setTopic({...topic, subtopic: e.target.value})}
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleGenerate}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                    >
                      Start Assessment
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Right: History List */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Past Results</h2>
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 bg-white/50 rounded-2xl border border-dashed border-gray-300">
                      No tests taken yet. Start your first one!
                    </div>
                  ) : (
                    history.map((test, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                        className="bg-white/70 backdrop-blur-sm p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center"
                      >
                        <div>
                          <h3 className="font-bold text-gray-800">{test.domain}</h3>
                          <p className="text-sm text-gray-500">{test.topic} • {new Date(test.attemptDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${getScoreColor(test.percentage)}`}>
                            {test.percentage}%
                          </p>
                          <p className="text-xs text-gray-400">{test.score}/{test.totalQuestions} Correct</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

            </motion.div>
          )}

          {/* ================= PHASE 2: LOADING ================= */}
          {phase === "loading" && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[50vh]"
            >
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-b-4 border-purple-500 border-solid rounded-full animate-spin reverse"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-700 animate-pulse">Generating Questions...</h2>
              <p className="text-gray-500 mt-2">AI is crafting a unique test for you.</p>
            </motion.div>
          )}

          {/* ================= PHASE 3: TESTING ================= */}
          {phase === "testing" && (
            <motion.div
              key="testing"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/50">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded uppercase tracking-wider">
                      {topic.domain}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1">{topic.subtopic}</h2>
                  </div>
                  <span className="text-gray-400 font-mono text-sm">
                    {Object.keys(answers).length} / {questions.length} Answered
                  </span>
                </div>

                <div className="space-y-8">
                  {questions.map((q, qIdx) => (
                    <div key={qIdx} className="animate-fadeIn">
                      <p className="font-medium text-lg text-gray-800 mb-4">
                        <span className="text-gray-400 mr-2">{qIdx + 1}.</span>
                        {q.question}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                        {q.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setAnswers({...answers, [qIdx]: opt})}
                            className={`p-3 text-left text-sm rounded-lg border transition-all duration-200 ${
                              answers[qIdx] === opt 
                                ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]" 
                                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all"
                  >
                    Submit Assessment
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= PHASE 4: RESULT ================= */}
          {phase === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto text-center"
            >
              <div className="bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden">
                {/* Confetti / Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                <h2 className="text-3xl font-bold text-gray-800 mb-2">Assessment Complete!</h2>
                <p className="text-gray-500 mb-8">Here is how you performed on {topic.subtopic}</p>

                <div className="relative inline-block mb-8">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-200" />
                    <circle 
                      cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" 
                      className={getScoreColor(result.percentage)}
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * result.percentage) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className={`text-4xl font-bold ${getScoreColor(result.percentage)}`}>{result.percentage}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Score</p>
                    <p className="text-xl font-bold text-gray-800">{result.score} / {result.total}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                    <p className={`text-xl font-bold ${result.percentage >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.percentage >= 50 ? 'Passed' : 'Needs Work'}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setPhase("dashboard");
                    setQuestions([]);
                    setAnswers({});
                    setTopic({ domain: "", subtopic: "" });
                  }}
                  className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Take Another Test
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* --- Custom CSS for Gradient Text Animation --- */}
        <style>{`
          @keyframes text {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-text {
            background-size: 200% auto;
            animation: text 5s ease infinite;
          }
          .reverse { animation-direction: reverse; }
        `}</style>
      </div>
    </StudentLayout>
  );
};

export default Tests;