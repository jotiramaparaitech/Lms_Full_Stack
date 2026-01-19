import React, { useState, useContext, useEffect } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Suggestions for the Dropdown
const SUGGESTED_DOMAINS = [
  "React JS", "Node JS", "Python", "JavaScript", "Java", "C++", 
  "SQL", "MongoDB", "Data Structures", "HTML/CSS", "Machine Learning", 
  "Artificial Intelligence", "DevOps", "Cybersecurity", "Flutter", "Swift"
];

const Tests = () => {
  const { 
    backendUrl, 
    getToken, 
    userData,
    enrolledCourses,
    fetchUserEnrolledCourses,
  } = useContext(AppContext);

  // --- STATES ---
  const [phase, setPhase] = useState("dashboard");
  const [history, setHistory] = useState([]); 
  const [topic, setTopic] = useState({ domain: "", subtopic: "" });
  
  // State to handle "Others" selection
  const [isCustomDomain, setIsCustomDomain] = useState(false);

  // Difficulty State
  const [difficulty, setDifficulty] = useState("Medium");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // --- FETCH HISTORY ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await getToken();
        if(token){
          const { data } = await axios.get(`${backendUrl}/api/assessment/history`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (data.success) {
            setHistory(data.history);
            const today = new Date().toDateString();
            const todaysTests = data.history.filter(
              (test) => new Date(test.attemptDate).toDateString() === today
            );
            setDailyCount(todaysTests.length);
          }
        }
      } catch (error) {
        console.error("Failed to load history");
      }
    };
    fetchHistory();
  }, [backendUrl, getToken, phase]);

  // --- FETCH ENROLLMENTS ---
  useEffect(() => {
    if (userData) fetchUserEnrolledCourses();
  }, [userData]);


  // ✅ LOGIC: Determine Limit based on enrollment
  // If enrolledCourses array has items, limit is 5, otherwise 3.
  const hasActiveEnrollment = enrolledCourses && enrolledCourses.length > 0;
  const maxDailyLimit = hasActiveEnrollment ? 5 : 3;

  // --- GENERATE TEST ---
  const handleGenerate = async (
    selectedDomain = topic.domain, 
    selectedTopic = topic.subtopic,
    selectedDifficulty = difficulty 
  ) => {
    
    if (!selectedDomain) {
      toast.error("Please select a domain");
      return;
    }

    const finalTopic = selectedTopic || "general assessment";

    // ✅ CHECK: Use dynamic maxDailyLimit
    if (dailyCount >= maxDailyLimit) {
      toast.error(`Daily limit of ${maxDailyLimit} tests reached`);
      return;
    }
    
    setLoading(true);
    setPhase("loading");
    
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/assessment/generate`,
        { 
            domain: selectedDomain, 
            topic: finalTopic,
            difficulty: selectedDifficulty 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTopic({ domain: selectedDomain, subtopic: finalTopic });
      setQuestions(data.data);
      setPhase("testing");
      
      if (data.isFallback) toast('Serving from backup question bank', { icon: '📂' });

    } catch (error) {
      console.error(error);
      toast.error("Failed to generate test. Please try a valid technical topic.");
      setPhase("dashboard");
    } finally {
      setLoading(false);
    }
  };

  const startProjectTest = (courseTitle) => {
    handleGenerate(courseTitle, "Project Assessment", "Medium");
  };

  // --- SUBMIT TEST ---
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
      toast.success("Assessment submitted successfully");
    } catch (error) {
      toast.error("Submission failed");
    }
  };

  // --- UI HELPERS ---
  // ✅ CHECK: Use dynamic maxDailyLimit
  const isLimitReached = dailyCount >= maxDailyLimit;

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Skill Assessment</h1>
              <p className="text-gray-500 mt-1">Validate your skills with AI-powered tests.</p>
            </div>
            <div className="flex items-center gap-4">
              {/* ✅ UI: Display dynamic limit */}
              <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${isLimitReached ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                Tests Today: {dailyCount} / {maxDailyLimit}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* ================= PHASE 1: DASHBOARD ================= */}
          {phase === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-8"
            >
              
              {/* --- Section A: Active Projects (ONLY FOR ENROLLED) --- */}
              {enrolledCourses.length > 0 && (
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">📂</span> Active Projects
                    </h2>
                    <div className="space-y-3">
                        {enrolledCourses.map((course, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md hover:border-blue-300 transition-all duration-300"
                        >
                            <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shadow-sm group-hover:scale-105 transition-transform">
                                <img 
                                src={course.courseThumbnail} 
                                alt={course.courseTitle}
                                className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{course.courseTitle}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Enrolled</span>
                                </div>
                            </div>
                            </div>
                            
                            <button
                            onClick={() => startProjectTest(course.courseTitle)}
                            disabled={isLimitReached || loading}
                            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                                isLimitReached || loading
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg active:scale-95"
                            }`}
                            >
                            {loading ? "Loading..." : "Take Test"}
                            {!loading && <span className="text-lg">→</span>}
                            </button>
                        </motion.div>
                        ))}
                    </div>
                </div>
              )}

              {/* --- Section B: Custom Test & History --- */}
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Custom Test Card */}
                <div className="lg:col-span-1">
                  <div className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-6 ${isLimitReached ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        ⚡
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800 leading-none">Custom Test</h3>
                          <p className="text-xs text-gray-500 mt-1">Challenge yourself</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      
                      {/* Domain Input */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Domain / Technology</label>
                        <div className="relative">
                            <select
                                disabled={isLimitReached}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all disabled:bg-gray-100 appearance-none text-gray-700"
                                value={isCustomDomain ? "Others" : topic.domain}
                                onChange={(e) => {
                                    const selected = e.target.value;
                                    if (selected === "Others") {
                                        setIsCustomDomain(true);
                                        setTopic({ ...topic, domain: "" }); 
                                    } else {
                                        setIsCustomDomain(false);
                                        setTopic({ ...topic, domain: selected });
                                    }
                                }}
                            >
                                <option value="" disabled>Select a Domain</option>
                                {SUGGESTED_DOMAINS.map((domain, idx) => (
                                    <option key={idx} value={domain}>{domain}</option>
                                ))}
                                <option value="Others" className="font-semibold text-blue-600">Others...</option>
                            </select>
                            
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                            </div>
                        </div>

                        {isCustomDomain && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3"
                            >
                                <input 
                                    type="text"
                                    disabled={isLimitReached}
                                    className="w-full px-4 py-3 bg-white border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 shadow-sm"
                                    placeholder="Specify your domain (e.g. Ruby on Rails)"
                                    value={topic.domain}
                                    onChange={(e) => setTopic({...topic, domain: e.target.value})}
                                    autoFocus
                                />
                            </motion.div>
                        )}
                      </div>
                      
                      {/* Topic Input - DISABLED IF NOT ENROLLED */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Specific Topic</label>
                        <input 
                          disabled={isLimitReached || !hasActiveEnrollment}
                          className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${
                             !hasActiveEnrollment 
                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" 
                                : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                          }`}
                          placeholder={hasActiveEnrollment ? "e.g. Hooks, Arrays, OOP" : "Enroll to unlock specific topics"}
                          value={topic.subtopic}
                          onChange={(e) => setTopic({...topic, subtopic: e.target.value})}
                        />
                      </div>

                      {/* Difficulty Selector */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Difficulty</label>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                           {["Basic", "Medium", "Hard"].map((level) => (
                             <button
                               key={level}
                               onClick={() => setDifficulty(level)}
                               disabled={isLimitReached}
                               className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                                 difficulty === level 
                                   ? "bg-white text-blue-600 shadow-sm border border-gray-200" 
                                   : "text-gray-500 hover:text-gray-700"
                               }`}
                             >
                               {level}
                             </button>
                           ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleGenerate()}
                        disabled={isLimitReached || loading}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? "Analyzing..." : "Start Assessment"}
                      </button>
                    </div>
                    
                    {isLimitReached && (
                      <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium text-center border border-red-100">
                        Daily test limit reached.
                      </div>
                    )}
                  </div>
                </div>

                {/* History Section */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6">Recent History</h3>
                    
                    {history.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                        <p className="text-gray-400 font-medium">No assessments taken yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {history.map((test, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all group"
                          >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                   test.percentage >= 80 ? 'bg-green-100 text-green-700' :
                                   test.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>
                                   {test.percentage}%
                                </div>
                                <div>
                                  <p className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{test.domain}</p>
                                  <div className="flex items-center gap-2">
                                     <span className="text-xs text-gray-500">{test.topic}</span>
                                     {test.difficulty && <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 uppercase">{test.difficulty}</span>}
                                  </div>
                                </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium text-gray-400">
                                {new Date(test.attemptDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">{test.score}/{test.total} correct</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* ================= PHASE 2: LOADING ================= */}
          {phase === "loading" && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[50vh]"
            >
              <div className="relative mb-8">
                <div className="w-20 h-20 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-blue-600 animate-pulse">
                    AI
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Generating Questions</h3>
              <p className="text-gray-500">Retrieving <span className="font-semibold text-blue-600">{difficulty}</span> questions for {topic.domain}...</p>
            </motion.div>
          )}

          {/* ================= PHASE 3: TESTING ================= */}
          {phase === "testing" && (
            <motion.div
              key="testing"
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                {/* Test Header */}
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <div className="flex gap-2 mb-2">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full">
                          {topic.domain}
                        </span>
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-full">
                          {difficulty}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{topic.subtopic}</h2>
                  </div>
                  <div className="text-right">
                      <span className="block text-3xl font-bold text-gray-200">{Object.keys(answers).length}/{questions.length}</span>
                      <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Progress</span>
                  </div>
                </div>

                <div className="p-8 space-y-10">
                  {questions.map((q, qIdx) => (
                    <div key={qIdx} className="animate-fadeIn">
                      <div className="flex gap-4 mb-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                          {qIdx + 1}
                        </span>
                        <p className="text-lg font-medium text-gray-800 leading-relaxed pt-1">{q.question}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                        {q.options.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => setAnswers({...answers, [qIdx]: opt})}
                            className={`px-5 py-4 text-left rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                              answers[qIdx] === opt 
                                ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]" 
                                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-600"
                            }`}
                          >
                            <span className="relative z-10 font-medium">{opt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-between items-center">
                    <button
                      onClick={() => setPhase("dashboard")}
                      className="px-6 py-2 text-gray-500 font-bold hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5"
                    >
                      Submit Assessment
                    </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= PHASE 4: RESULT ================= */}
          {phase === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
                    <circle 
                      cx="64" cy="64" r="56" fill="none" 
                      stroke={result.percentage >= 70 ? "#10b981" : result.percentage >= 50 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8" 
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - result.percentage / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-gray-800">{result.percentage}%</span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-1">Assessment Complete!</h3>
                <p className="text-gray-500 mb-8 text-sm">{topic.subtopic}</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">{result.score}/{result.total}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Score</div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className={`text-xl font-bold ${result.percentage >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.percentage >= 50 ? 'Passed' : 'Review'}
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Status</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPhase("dashboard");
                    setQuestions([]);
                    setAnswers({});
                    setTopic({ domain: "", subtopic: "" });
                    setIsCustomDomain(false);
                  }}
                  className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </StudentLayout>
  );
};

export default Tests;