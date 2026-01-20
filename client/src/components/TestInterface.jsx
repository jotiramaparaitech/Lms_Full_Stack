import React, { useState } from "react";
import { motion } from "framer-motion";

const TestInterface = ({ 
  topic, 
  difficulty, 
  questions, 
  answers, 
  setAnswers, 
  handleSubmit, 
  onCancel,
  isMobile = false 
}) => {
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleSafeSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await handleSubmit();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  // Mobile navigation
  const goToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleAnswerSelect = (questionIdx, answer) => {
    setAnswers({...answers, [questionIdx]: answer});
    // Auto-advance on mobile if not last question
    if (isMobile && questionIdx === currentQuestion && questionIdx < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(questionIdx + 1), 200);
    }
  };

  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0 }}
      className={`${isMobile ? 'w-full' : 'max-w-3xl mx-auto'}`}
    >
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        {/* Test Header */}
        <div className="bg-gray-50 px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <div className="flex gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
              <span className="inline-block px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full">
                {topic.domain}
              </span>
              <span className="inline-block px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-full">
                {difficulty}
              </span>
            </div>
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
              {topic.subtopic || "Assessment"}
            </h2>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <span className="block text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              {Object.keys(answers).length}/{questions.length}
            </span>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-bold hidden sm:block">
              Progress
            </span>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        {isMobile && (
          <div className="px-4 pt-3 pb-2 border-b border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Questions Area */}
        <div className="p-4 sm:p-8">
          {isMobile ? (
            // Mobile: Single Question View
            <div key={currentQuestion} className="animate-fadeIn">
              <div className="flex gap-3 mb-4">
                <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                  {currentQuestion + 1}
                </span>
                <p className="text-base font-medium text-gray-800 leading-relaxed pt-0.5">
                  {questions[currentQuestion].question}
                </p>
              </div>
              
              {/* Options */}
              <div className="space-y-2 pl-10">
                {questions[currentQuestion].options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleAnswerSelect(currentQuestion, opt)}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 text-left rounded-lg border transition-all duration-200 group relative overflow-hidden ${
                      answers[currentQuestion] === opt 
                        ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20 transform scale-[1.02]" 
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-600"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className="relative z-10 font-medium text-sm">{opt}</span>
                  </button>
                ))}
              </div>

              {/* NEW: Mobile Navigation Actions (Inline) */}
              <div className="mt-8 pl-0 sm:pl-10 space-y-3">
                
                {/* Row 1: Prev & Next/Submit */}
                <div className="flex gap-3">
                  <button
                    onClick={goToPrev}
                    disabled={currentQuestion === 0 || isSubmitting}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm border transition-colors ${
                      currentQuestion === 0 
                        ? "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50" 
                        : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    Previous
                  </button>
                  
                  <button
                    onClick={isLastQuestion ? handleSafeSubmit : goToNext}
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex justify-center items-center gap-2 ${
                      isLastQuestion
                        ? "bg-green-600 hover:bg-green-700 shadow-green-500/20"
                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                    } ${isSubmitting ? "opacity-75 cursor-wait" : ""}`}
                  >
                     {isSubmitting && (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {isLastQuestion ? (isSubmitting ? "Sending..." : "Submit") : "Next"}
                  </button>
                </div>

                {/* Row 2: Cancel */}
                <button 
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="w-full py-5 text-gray-400 font-medium text-sm hover:text-red-500 transition-colors"
                >
                  Cancel Assessment
                </button>
              </div>

            </div>
          ) : (
            // Desktop: All Questions View (Unchanged)
            <div className="space-y-8 sm:space-y-10">
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
                        disabled={isSubmitting}
                        className={`px-5 py-4 text-left rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                          answers[qIdx] === opt 
                            ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]" 
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-600"
                        } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span className="relative z-10 font-medium">{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Footer (Unchanged) */}
        {!isMobile && (
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-between items-center">
            <button 
              onClick={onCancel} 
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-500 font-bold hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            
            <button 
              onClick={handleSafeSubmit} 
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${
                isSubmitting 
                ? "bg-gray-400 text-white cursor-not-allowed shadow-none" 
                : "bg-green-600 hover:bg-green-700 text-white shadow-green-500/20 hover:-translate-y-0.5"
              }`}
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isSubmitting ? "Submitting..." : "Submit Assessment"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TestInterface;