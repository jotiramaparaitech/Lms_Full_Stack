import React, { useState } from "react";
import { motion } from "framer-motion";

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * TestInterface Component
 * 
 * This component renders a test interface for a given topic and difficulty.
 * It displays the test header, test questions, and options for each question.
 * It also displays the progress of the test and allows the user to submit the test.
 * 
 * @param {Object} topic - The topic of the test.
 * @param {String} difficulty - The difficulty of the test.
 * @param {Object[]} questions - The questions of the test.
 * @param {Object} answers - The answers of the test.
 * @param {Function} setAnswers - A function to set the answers of the test.
 * @param {Function} handleSubmit - A function to handle the submission of the test.
 * @param {Function} onCancel - A function to handle the cancellation of the test.
 */
/*******  7380f963-cca7-4aef-b027-61fe7febdd59  *******/const TestInterface = ({ 
  topic, 
  difficulty, 
  questions, 
  answers, 
  setAnswers, 
  handleSubmit, 
  onCancel 
}) => {
  
  // ✅ Local state to prevent multiple clicks
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Wrapper function to handle the loading state
  const handleSafeSubmit = async () => {
    if (isSubmitting) return; // Stop if already submitting
    
    setIsSubmitting(true);
    try {
      await handleSubmit();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false); // Reset if there was an error and we are still on this screen
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        {/* Test Header */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <div className="flex gap-2 mb-2">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full">{topic.domain}</span>
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-full">{difficulty}</span>
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
                    disabled={isSubmitting} // Disable options during submit
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

        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-between items-center">
            <button 
              onClick={onCancel} 
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-500 font-bold hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            
            {/* ✅ Updated Submit Button */}
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
      </div>
    </motion.div>
  );
};

export default TestInterface;