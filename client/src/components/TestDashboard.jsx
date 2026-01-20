import React, { useState } from "react";
import { motion } from "framer-motion";

const SUGGESTED_DOMAINS = [
  "React JS", "Node JS", "Python", "JavaScript", "Java", "C++", 
  "SQL", "MongoDB", "Data Structures", "HTML/CSS", "Machine Learning", 
  "Artificial Intelligence", "DevOps", "Cybersecurity", "Flutter", "Swift"
];

const TestDashboard = ({ 
  enrolledCourses, 
  history, 
  isLimitReached, 
  loading, 
  handleGenerate, 
  hasActiveEnrollment,
  topic,
  setTopic,
  difficulty,
  setDifficulty
}) => {
  
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  
  // ✅ New State: Track difficulty for each individual project
  // Key = courseTitle, Value = difficulty level
  const [projectDifficulties, setProjectDifficulties] = useState({});

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="space-y-8"
    >
      
      {/* --- Section A: Active Projects --- */}
      {enrolledCourses.length > 0 && (
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📂</span> Active Projects
            </h2>
            <div className="space-y-3">
                {enrolledCourses.map((course, index) => {
                    // Get difficulty for this specific course, default to "Medium"
                    const currentProjectDifficulty = projectDifficulties[course.courseTitle] || "Medium";

                    return (
                        <div key={index} className="group bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md hover:border-blue-300 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                                    <img src={course.courseThumbnail} alt={course.courseTitle} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{course.courseTitle}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Enrolled</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {/* ✅ Difficulty Dropdown for Projects */}
                                <select 
                                    value={currentProjectDifficulty}
                                    disabled={isLimitReached || loading}
                                    onChange={(e) => setProjectDifficulties({
                                        ...projectDifficulties,
                                        [course.courseTitle]: e.target.value
                                    })}
                                    className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <option value="Basic">Basic</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>

                                <button
                                    onClick={() => handleGenerate(course.courseTitle, "Project Assessment", currentProjectDifficulty)}
                                    disabled={isLimitReached || loading}
                                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                                        isLimitReached || loading
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg active:scale-95"
                                    }`}
                                >
                                    {loading ? "Loading..." : "Take Test"}
                                    {!loading && <span className="text-lg">→</span>}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {/* --- Section B: Custom Test & History --- */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Custom Test Card */}
        <div className="lg:col-span-1">
          <div className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-6 ${isLimitReached ? 'opacity-70 grayscale-[0.5]' : ''}`}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">⚡</div>
              <div>
                  <h3 className="font-bold text-gray-800 leading-none">Custom Test</h3>
                  <p className="text-xs text-gray-500 mt-1">Challenge yourself</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Domain Input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Domain</label>
                <div className="relative">
                    <select
                        disabled={isLimitReached}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-gray-100 appearance-none text-gray-700"
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
                </div>
                {isCustomDomain && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                        <input 
                            type="text"
                            disabled={isLimitReached}
                            className="w-full px-4 py-3 bg-white border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Specify your domain"
                            value={topic.domain}
                            onChange={(e) => setTopic({...topic, domain: e.target.value})}
                        />
                    </motion.div>
                )}
              </div>
              
              {/* Topic Input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Topic</label>
                <input 
                  disabled={isLimitReached || !hasActiveEnrollment}
                  className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${!hasActiveEnrollment ? "bg-gray-100 text-gray-400" : "bg-gray-50 focus:ring-2 focus:ring-blue-500"}`}
                  placeholder={hasActiveEnrollment ? "e.g. Hooks, Arrays" : "Enroll to unlock"}
                  value={topic.subtopic}
                  onChange={(e) => setTopic({...topic, subtopic: e.target.value})}
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Difficulty</label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                   {["Basic", "Medium", "Hard"].map((level) => (
                     <button
                       key={level}
                       onClick={() => setDifficulty(level)}
                       disabled={isLimitReached}
                       className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                         difficulty === level ? "bg-white text-blue-600 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"
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
          </div>
        </div>

        {/* History List */}
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
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            test.percentage >= 80 ? 'bg-green-100 text-green-700' :
                            test.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {test.percentage}%
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{test.domain}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-xs text-gray-500">{test.topic}</span>
                             {test.difficulty && (
                               <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 uppercase">
                                 {test.difficulty}
                               </span>
                             )}
                          </div>
                        </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-400">{new Date(test.attemptDate).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{test.score}/{test.total} correct</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TestDashboard;