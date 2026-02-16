import React, { useState } from "react";
import { motion } from "framer-motion";

const TestAnalysis = ({ result, onDone, isMobile }) => {
  const [showMistakesOnly, setShowMistakesOnly] = useState(false);

  // If result.results is undefined (older tests), fallback safely
  const questions = result.results || [];

  const filteredQuestions = showMistakesOnly
    ? questions.filter((q) => !q.isCorrect)
    : questions;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-3xl mx-auto pb-8"
    >
      {/* Header Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Detailed Analysis</h2>
            <p className="text-sm text-gray-500">
              Review your answers before leaving.
            </p>
          </div>
          
          {/* Toggle Switch */}
          <label className="flex items-center cursor-pointer select-none bg-gray-100 p-1.5 rounded-lg border border-gray-200">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={showMistakesOnly}
                onChange={() => setShowMistakesOnly(!showMistakesOnly)}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${showMistakesOnly ? 'bg-red-500' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showMistakesOnly ? 'translate-x-full' : ''}`}></div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700 mr-2">Mistakes Only</span>
          </label>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
            <p className="text-gray-500 font-medium">
              {showMistakesOnly ? "Great job! No mistakes found." : "No questions available."}
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl border-l-4 p-4 sm:p-6 shadow-sm ${
                q.isCorrect ? "border-l-green-500 border-gray-100" : "border-l-red-500 border-red-50"
              }`}
            >
              {/* Question Text */}
              <div className="flex items-start gap-3 mb-4">
                <span className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold ${
                   q.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {index + 1}
                </span>
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 leading-relaxed">
                  {q.questionText}
                </h3>
              </div>

              {/* Options Grid */}
              <div className="space-y-2 pl-2 sm:pl-11">
                {q.options && q.options.length > 0 ? (
                  q.options.map((option, optIndex) => {
                    const isSelected = option === q.selectedOption;
                    const isCorrect = option === q.correctOption;
                    
                    let bgClass = "bg-gray-50 border-gray-200";
                    let textClass = "text-gray-700";
                    let icon = null;

                    if (isCorrect) {
                      bgClass = "bg-green-50 border-green-200 ring-1 ring-green-200";
                      textClass = "text-green-800 font-medium";
                      icon = (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      );
                    } else if (isSelected && !isCorrect) {
                      bgClass = "bg-red-50 border-red-200 ring-1 ring-red-200";
                      textClass = "text-red-800 font-medium";
                      icon = (
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      );
                    }

                    return (
                      <div 
                        key={optIndex} 
                        className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-colors ${bgClass}`}
                      >
                        <span className={textClass}>{option}</span>
                        {icon}
                      </div>
                    );
                  })
                ) : (
                  // Fallback for old tests without options saved
                  <div className="text-gray-400 text-sm italic p-2">
                    Options not available for this legacy test.
                    <div className="mt-2 text-green-600 font-medium">Correct Answer: {q.correctOption}</div>
                  </div>
                )}
              </div>

            </motion.div>
          ))
        )}
      </div>

      {/* Done Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onDone}
          className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all active:scale-95 w-full sm:w-auto"
        >
          Done & Return to Dashboard
        </button>
      </div>
    </motion.div>
  );
};

export default TestAnalysis;