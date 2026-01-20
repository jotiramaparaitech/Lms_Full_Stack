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

// ✅ Import your existing Loading component
import Loading from "../../components/student/Loading"; 

const Tests = () => {
  const { 
    backendUrl, 
    getToken, 
    userData,
    enrolledCourses,
    fetchUserEnrolledCourses,
  } = useContext(AppContext);

  // --- STATES ---
  const [phase, setPhase] = useState("dashboard"); // dashboard, loading, testing, result
  const [history, setHistory] = useState([]); 
  const [topic, setTopic] = useState({ domain: "", subtopic: "" });
  const [difficulty, setDifficulty] = useState("Medium");
  
  // Test Data
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // --- LOGIC: Limits ---
  const hasActiveEnrollment = enrolledCourses && enrolledCourses.length > 0;
  const maxDailyLimit = hasActiveEnrollment ? 5 : 3;
  const isLimitReached = dailyCount >= maxDailyLimit;

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
    selectedDifficulty = difficulty 
  ) => {
    if (!selectedDomain) {
      toast.error("Please select a domain");
      return;
    }

    if (dailyCount >= maxDailyLimit) {
      toast.error(`Daily limit of ${maxDailyLimit} tests reached`);
      return;
    }
    
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
      toast.error("Failed to generate test.");
      setPhase("dashboard");
    } finally {
      setLoading(false);
    }
  };

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
          difficulty: difficulty.toLowerCase(),
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

  const resetTest = () => {
    setPhase("dashboard");
    setQuestions([]);
    setAnswers({});
    setTopic({ domain: "", subtopic: "" });
  };

  return (
    <StudentLayout>
      {/* ✅ FIX: Removed 'min-h-screen' here when loading.
         Your Loading component has 'min-h-screen' inside it, so this prevents 
         double scrollbars/layout shifts.
      */}
      <div className={`${phase === 'loading' ? '' : 'min-h-screen'} bg-gray-50 p-4 md:p-6 font-sans`}>
        
        {/* ✅ FIX: Hide Header when loading to show only the spinner */}
        {phase !== 'loading' && (
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Skill Assessment</h1>
                <p className="text-gray-500 mt-1">Validate your skills with AI-powered tests.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${isLimitReached ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                  Tests Today: {dailyCount} / {maxDailyLimit}
                </div>
              </div>
            </div>
          </div>
        )}

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
            />
          )}

          {/* ✅ FIX: Replaced custom LoadingView with your existing component */}
          {phase === "loading" && (
             <motion.div 
               key="loading"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             >
                <Loading />
             </motion.div>
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
            />
          )}

          {phase === "result" && result && (
            <TestResult 
              key="result"
              result={result}
              topic={topic}
              onReset={resetTest}
            />
          )}

        </AnimatePresence>
      </div>
    </StudentLayout>
  );
};

export default Tests;