import React from "react";
import { motion } from "framer-motion";

const TestResult = ({ result, topic, onReset }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        {/* Animated Circle Chart */}
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
          onClick={onReset}
          className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
        >
          Return to Dashboard
        </button>
      </div>
    </motion.div>
  );
};

export default TestResult;