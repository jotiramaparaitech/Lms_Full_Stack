import React, { useState, useEffect, useRef } from "react";
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
  const [projectDifficulties, setProjectDifficulties] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Filter domains based on search
  const filteredDomains = SUGGESTED_DOMAINS.filter(domain =>
    domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle domain selection
  const handleDomainSelect = (domain) => {
    if (domain === "Others") {
      setIsCustomDomain(true);
      setTopic({ ...topic, domain: "" });
    } else {
      setIsCustomDomain(false);
      setTopic({ ...topic, domain: domain });
    }
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="space-y-8 w-full max-w-full overflow-hidden" // Added overflow-hidden to prevent horizontal scroll
    >
      
      {/* --- Section A: Active Projects --- */}
      {enrolledCourses.length > 0 && (
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📂</span> Active Projects
          </h2>
          <div className="space-y-3">
            {enrolledCourses.map((course, index) => {
              const currentProjectDifficulty = projectDifficulties[course.courseTitle] || "Medium";

              return (
                <div key={index} className="group bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md hover:border-blue-300 transition-all duration-300">
                  
                  {/* Course Info */}
                  <div className="flex items-center gap-4 min-w-0"> {/* min-w-0 prevents text overflow */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shadow-sm flex-shrink-0">
                      <img src={course.courseThumbnail} alt={course.courseTitle} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                        {course.courseTitle}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Enrolled</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select 
                      value={currentProjectDifficulty}
                      disabled={isLimitReached || loading}
                      onChange={(e) => setProjectDifficulties({
                        ...projectDifficulties,
                        [course.courseTitle]: e.target.value
                      })}
                      className="flex-1 sm:flex-none sm:w-32 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <option value="Basic">Basic</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>

                    <button
                      onClick={() => handleGenerate(course.courseTitle, "Project Assessment", currentProjectDifficulty)}
                      disabled={isLimitReached || loading}
                      className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
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
        <div className="lg:col-span-1 min-w-0">
          <div className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-6 ${isLimitReached ? 'opacity-70 grayscale-[0.5]' : ''}`}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 flex-shrink-0">⚡</div>
              <div>
                <h3 className="font-bold text-gray-800 leading-none">Custom Test</h3>
                <p className="text-xs text-gray-500 mt-1">Challenge yourself</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Searchable Domain Input */}
              <div ref={dropdownRef} className="relative w-full">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Domain</label>
                
                <div className="relative w-full">
                  <button
                    type="button"
                    disabled={isLimitReached}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-left flex justify-between items-center transition-all ${
                      isLimitReached ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'
                    } ${isDropdownOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                  >
                    <span className={`block truncate mr-2 ${topic.domain ? 'text-gray-700' : 'text-gray-400'}`}>
                      {topic.domain || "Select a Domain"}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && !isLimitReached && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto left-0"
                    >
                      <div className="sticky top-0 bg-white border-b border-gray-100 p-2 z-10">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search..."
                          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      </div>

                      <div className="py-1">
                        {filteredDomains.map((domain, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleDomainSelect(domain)}
                            className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors ${
                              topic.domain === domain ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            <span className="block truncate">{domain}</span>
                          </button>
                        ))}
                        
                        <button
                          type="button"
                          onClick={() => handleDomainSelect("Others")}
                          className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors border-t border-gray-100 ${
                            isCustomDomain ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-blue-600'
                          }`}
                        >
                          <span className="font-semibold block truncate">Others...</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Manual Input */}
                {isCustomDomain && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 overflow-hidden w-full"
                  >
                    <input 
                      type="text"
                      disabled={isLimitReached}
                      className="w-full px-4 py-3 bg-white border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Specify your domain..."
                      value={topic.domain}
                      onChange={(e) => setTopic({...topic, domain: e.target.value})}
                    />
                  </motion.div>
                )}
              </div>
              
              {/* Topic Input */}
              <div className="w-full">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Topic</label>
                <input 
                  disabled={isLimitReached || !hasActiveEnrollment}
                  className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${
                    !hasActiveEnrollment 
                      ? "bg-gray-100 text-gray-400" 
                      : "bg-gray-50 focus:ring-2 focus:ring-blue-500"
                  }`}
                  placeholder={hasActiveEnrollment ? "e.g. Hooks, Arrays" : "Enroll to unlock"}
                  value={topic.subtopic}
                  onChange={(e) => setTopic({...topic, subtopic: e.target.value})}
                />
              </div>

              {/* Difficulty */}
              <div className="w-full">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Difficulty</label>
                <div className="flex bg-gray-100 p-1 rounded-xl w-full">
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
                disabled={isLimitReached || loading || !topic.domain}
                className={`w-full py-3.5 text-white rounded-xl font-bold shadow-lg transition-all ${
                  isLimitReached || loading || !topic.domain
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/50 hover:-translate-y-0.5"
                }`}
              >
                {loading ? "Analyzing..." : "Start Assessment"}
              </button>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 w-full min-w-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm w-full">
            <h3 className="font-bold text-gray-800 mb-6">Recent History</h3>
            {history.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-gray-400 font-medium">No assessments taken yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((test, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all w-full">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        test.percentage >= 80 ? 'bg-green-100 text-green-700' : 
                        test.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {test.percentage}%
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-800 text-sm truncate">{test.domain}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 truncate">{test.topic}</span>
                          {test.difficulty && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 uppercase flex-shrink-0">
                              {test.difficulty}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs font-medium text-gray-400 whitespace-nowrap">
                        {new Date(test.attemptDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">
                        {test.score}/{test.total} correct
                      </p>
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