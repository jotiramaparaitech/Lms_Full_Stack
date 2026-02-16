import React, { useState, useContext, useEffect } from "react";
import StudentLayout from "../../components/student/StudentLayout";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

// Import Modules
import TestDashboard from "../../components/TestDashboard";
import TestInterface from "../../components/TestInterface";
import TestResult from "../../components/TestResult";
import TestAnalysis from "../../components/TestAnalysis"; // <--- IMPORTED ANALYSIS COMPONENT

// ✅ Reverted to Custom Loader
import LoadingView from "../../components/LoadingView"; 

const Tests = () => {
  const { 
    backendUrl, 
    getToken, 
    userData,
    enrolledCourses,
    fetchUserEnrolledCourses,
  } = useContext(AppContext);

  // --- STATES ---
  const [phase, setPhase] = useState("dashboard"); // dashboard, loading, testing, result, analysis
  const [history, setHistory] = useState([]); 
  const [topic, setTopic] = useState({ domain: "", subtopic: "" });
  const [difficulty, setDifficulty] = useState("Medium");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");

  
  // Test Data
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // --- LOGIC: Limits ---
  const hasActiveEnrollment = enrolledCourses && enrolledCourses.length > 0;
  const maxDailyLimit = hasActiveEnrollment ? 5 : 3;
  const isLimitReached = dailyCount >= maxDailyLimit;

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- FETCH DATA ---
  useEffect(() => {
    if (userData) fetchUserEnrolledCourses();
  }, [userData]);

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

  // --- ACTIONS ---
  const handleGenerate = async (
    selectedDomain = topic.domain, 
    selectedTopic = topic.subtopic,
    diff = difficulty 
  ) => {
    if (!selectedDomain) {
      toast.error("Please select a domain");
      return;
    }

    if (dailyCount >= maxDailyLimit) {
      toast.error(`Daily limit of ${maxDailyLimit} tests reached`);
      return;
    }

    setSelectedDifficulty(diff); // ✅ freeze difficulty

    setLoading(true);
    setPhase("loading");
    
    try {
      const finalTopic = selectedTopic || "general assessment";
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/assessment/generate`,
        { 
          domain: selectedDomain, 
          topic: finalTopic,
          difficulty: diff 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTopic({ domain: selectedDomain, subtopic: finalTopic });
      setQuestions(data.data);
      setPhase("testing");
      
      if (data.isFallback) {
        toast('Serving from backup question bank', { 
          icon: '📂',
          position: isMobile ? 'top-center' : 'top-right'
        });
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to generate test.", {
        position: isMobile ? 'top-center' : 'top-right'
      });
      setPhase("dashboard");
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async () => {
    // ✅ UPDATE: We now send the 'options' array along with the answer
    const submissionData = questions.map((q, idx) => ({
      questionText: q.question,
      selectedOption: answers[idx] || "Skipped",
      correctOption: q.answer,
      options: q.options // <--- THIS IS THE KEY FIX
    }));

    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/assessment/submit`,
        {
          domain: topic.domain,
          topic: topic.subtopic,
          difficulty: difficulty.toLowerCase(),
          questionsData: submissionData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setResult(data);
      setPhase("result");
      toast.success("Assessment submitted successfully", {
        position: isMobile ? 'top-center' : 'top-right'
      });
    } catch (error) {
      toast.error("Submission failed", {
        position: isMobile ? 'top-center' : 'top-right'
      });
    }
  };

  const resetTest = () => {
    setPhase("dashboard");
    setQuestions([]);
    setAnswers({});
    setTopic({ domain: "", subtopic: "" });
    setResult(null); // Clear result data on exit
  };

  return (
    <StudentLayout>
      {/* ✅ FIX 1: Main Container Constraints */}
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 font-sans w-full max-w-full overflow-x-hidden">
        
        {/* Header - Mobile Responsive */}
        <div className="mb-6 sm:mb-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full">
            
            {/* ✅ FIX 2: min-w-0 on text container to allow truncation */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight truncate">
                Skill Assessment
              </h1>
              <p className="text-gray-500 text-sm sm:text-base mt-1 truncate">
                Validate your skills with AI-powered tests.
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
              <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border whitespace-nowrap ${
                isLimitReached 
                  ? 'bg-red-50 text-red-600 border-red-200' 
                  : 'bg-blue-50 text-blue-600 border-blue-200'
              }`}>
                <span className="sm:hidden">Tests: {dailyCount}/{maxDailyLimit}</span>
                <span className="hidden sm:inline">Tests Today: {dailyCount}/{maxDailyLimit}</span>
              </div>
              
              {/* Back button hidden during analysis to enforce "Done" flow */}
              {phase !== "dashboard" && phase !== "analysis" && isMobile && (
                <button
                  onClick={() => phase === "testing" ? setPhase("dashboard") : resetTest()}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                >
                  Back
                </button>
              )}
            </div>
          </div>
          
          {/* Mobile Progress Indicator */}
          {isMobile && phase !== "dashboard" && (
            <div className="mt-4 bg-white rounded-lg p-3 shadow-sm border w-full">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{topic.domain}</p>
                  <p className="text-xs text-gray-500 capitalize truncate">{difficulty} • {topic.subtopic || "General"}</p>
                </div>
                <div className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700 whitespace-nowrap flex-shrink-0">
                  {phase === "loading" && "Generating..."}
                  {phase === "testing" && `${Object.keys(answers).length}/${questions.length}`}
                  {phase === "result" && "Completed"}
                  {phase === "analysis" && "Reviewing"}
                </div>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          
          {phase === "dashboard" && (
            <TestDashboard 
              key="dashboard"
              enrolledCourses={enrolledCourses}
              history={history}
              isLimitReached={isLimitReached}
              loading={loading}
              handleGenerate={handleGenerate}
              hasActiveEnrollment={hasActiveEnrollment}
              topic={topic}
              setTopic={setTopic}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              isMobile={isMobile}
            />
          )}

          {phase === "loading" && (
             <LoadingView 
                key="loading" 
                difficulty={selectedDifficulty}  
                domain={topic.domain} 
                isMobile={isMobile}
             />
          )}

          {phase === "testing" && (
            <TestInterface 
              key="testing"
              topic={topic}
              difficulty={difficulty}
              questions={questions}
              answers={answers}
              setAnswers={setAnswers}
              handleSubmit={handleSubmit}
              onCancel={() => setPhase("dashboard")}
              isMobile={isMobile}
            />
          )}  

          {phase === "result" && result && (
            <TestResult 
              key="result"
              result={result}
              topic={topic}
              difficulty={selectedDifficulty}
              onReset={resetTest}
              onAnalyze={() => setPhase("analysis")} // <--- TRIGGERS NEW PHASE
              isMobile={isMobile}
            />
          )}

          {phase === "analysis" && result && (
            <TestAnalysis
              key="analysis"
              result={result}
              onDone={resetTest} // <--- Returns to Dashboard
              isMobile={isMobile}
            />
          )}

        </AnimatePresence>
        
      </div>
    </StudentLayout>
  );
};

export default Tests;