import React from "react";
import { assets } from "../../assets/assets";

const CallToAction = () => {
  return (
    <div
      className="w-full flex flex-col items-center gap-6 py-24 px-6 
                 bg-gradient-to-r from-green-800 via-blue-800 to-blue-700
                 text-white"
    >
      {/* Main Heading */}
      <h1 className="text-3xl md:text-5xl font-bold text-center leading-tight md:leading-snug">
        Learn anything, anytime, anywhere
      </h1>

      {/* Subtext */}
      <p className="text-gray-200 sm:text-base md:text-lg text-center max-w-2xl">
        Incididunt sint fugiat pariatur cupidatat consectetur sit cillum anim id
        veniam aliqua proident excepteur commodo do ea.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 w-full justify-center">
        {/* Primary Button */}
        <button
          className="px-12 py-3 rounded-full font-semibold text-white
                     bg-gradient-to-r from-cyan-500 to-blue-500
                     hover:from-cyan-400 hover:to-blue-400
                     shadow-lg hover:shadow-xl
                     transition-all duration-300 w-full sm:w-auto text-center"
        >
          Get started
        </button>

        {/* Secondary Button */}
        <button
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full 
                     font-medium border border-cyan-300 text-cyan-100
                     bg-white/10 backdrop-blur-sm hover:bg-white/20
                     shadow-md hover:shadow-lg
                     transition-all duration-300 w-full sm:w-auto"
        >
          Learn more
          <img
            src={assets.arrow_icon}
            alt="arrow_icon"
            className="w-4 h-4 invert brightness-150"
          />
        </button>
      </div>
    </div>
  );
};

export default CallToAction;
