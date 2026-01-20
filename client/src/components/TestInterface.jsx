import React from "react";
import { motion } from "framer-motion";

const TestInterface = ({ 
  topic, 
  difficulty, 
  questions, 
  answers, 
  setAnswers, 
  handleSubmit, 
  onCancel 
}) => {
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
            <button onClick={onCancel} className="px-6 py-2 text-gray-500 font-bold hover:text-gray-800 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5">
              Submit Assessment
            </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TestInterface;