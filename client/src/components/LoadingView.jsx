import React from "react";
import { motion } from "framer-motion";

const LoadingView = ({ difficulty, domain, isMobile = false }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[50vh] px-4"
    >
      <div className="relative mb-6 sm:mb-8">
        {/* Spinner Ring */}
        <div className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin`}></div>
        
        {/* Pulsing AI Text in Center */}
        <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-blue-600 animate-pulse">
          AI
        </div>
      </div>
      
      <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-800 mb-2 text-center`}>
        Generating Questions
      </h3>
      <p className="text-gray-500 text-center text-sm sm:text-base max-w-md mx-auto">
        Retrieving{" "}
        <span className="font-semibold text-blue-600 capitalize">{difficulty?.toLowerCase() || "medium"}</span>{" "}
        questions for{" "}
        <span className="font-semibold text-blue-600">
          {domain || "your topic"}
        </span>
        ...
      </p>
      
      {isMobile && (
        <div className="mt-6 w-full max-w-xs mx-auto">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "80%" }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">AI is crafting your questions</p>
        </div>
      )}
    </motion.div>
  );
};

export default LoadingView;