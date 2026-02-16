import React from "react";
import { motion } from "framer-motion";

const TestResult = ({ result, topic, difficulty, onReset, onAnalyze, isMobile = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isMobile ? 'w-full' : 'max-w-md'} mx-auto px-2 sm:px-0`}
    >
      <div className="bg-white rounded-xl sm:rounded-3xl border border-gray-100 p-4 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        {/* Animated Circle Chart */}
        <div className={`${isMobile ? 'w-24 h-24' : 'w-32 h-32'} mx-auto mb-4 sm:mb-6 relative`}>
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#f3f4f6" strokeWidth="6"/>
            <circle 
              cx="50%" cy="50%" r="45%" fill="none" 
              stroke={result.percentage >= 70 ? "#10b981" : result.percentage >= 50 ? "#f59e0b" : "#ef4444"}
              strokeWidth="6" 
              strokeLinecap="round"
              strokeDasharray={Math.PI * 90}
              strokeDashoffset={Math.PI * 90 * (1 - result.percentage / 100)}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-black text-gray-800`}>
              {result.percentage}%
            </span>
          </div>
        </div>

        <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 mb-1`}>
          Assessment Complete!
        </h3>
        <p className="text-gray-500 mb-4 sm:mb-8 text-xs sm:text-sm truncate max-w-full">
          {topic.subtopic || topic.domain}
        </p>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-gray-50 rounded-lg sm:rounded-2xl p-3 sm:p-4 border border-gray-100">
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>
              {result.score}/{result.total}
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Score</div>
          </div>
          <div className="bg-gray-50 rounded-lg sm:rounded-2xl p-3 sm:p-4 border border-gray-100">
            <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold ${
              result.percentage >= 50 ? 'text-green-600' : 'text-red-600'
            }`}>
              {result.percentage >= 50 ? 'Passed' : 'Review'}
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Status</div>
          </div>
        </div>

        {/* Detailed Stats for Desktop */}
        {!isMobile && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <h4 className="font-bold text-gray-800 mb-2 text-sm">Performance Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Accuracy</span>
                <span className="font-semibold text-gray-900">
                  {Math.round((result.score / result.total) * 100)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Difficulty</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {result.difficulty || difficulty || "Medium"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Time</span>
                <span className="font-semibold text-gray-900">Just now</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* New Review Button */}
          <button
            onClick={onAnalyze}
            className="w-full py-3 sm:py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-lg sm:rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm sm:text-base"
          >
            View Analysis
          </button>

          <button
            onClick={onReset}
            className="w-full py-3 sm:py-4 bg-gray-900 text-white rounded-lg sm:rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            {isMobile ? 'Return to Dashboard' : 'Return to Dashboard'}
          </button>
        </div>

      </div>
    </motion.div>
  );
};

export default TestResult;