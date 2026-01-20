import React from "react";
import { motion } from "framer-motion";

const LoadingView = ({ difficulty, domain }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[50vh]"
    >
      <div className="relative mb-8">
        {/* Spinner Ring */}
        <div className="w-20 h-20 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
        
        {/* Pulsing AI Text in Center */}
        <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-blue-600 animate-pulse">
            AI
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">Generating Questions</h3>
      <p className="text-gray-500">
        Retrieving <span className="font-semibold text-blue-600">{difficulty}</span> questions for {domain || "your topic"}...
      </p>
    </motion.div>
  );
};

export default LoadingView;