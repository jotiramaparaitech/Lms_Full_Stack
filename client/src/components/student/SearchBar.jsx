import React, { useState } from "react";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SearchBar = ({ data }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState(data ? data : "");

  const onSearchHandler = (e) => {
    e.preventDefault();
    navigate("/course-list/" + input);
  };

  return (
    <motion.form
      onSubmit={onSearchHandler}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 10 }}
      whileHover={{ scale: 1.02 }}
      className="relative max-w-xl w-full md:h-14 h-12 flex items-center rounded-full bg-white/80 border border-blue-300 shadow-[0_6px_15px_rgba(0,0,0,0.1)] backdrop-blur-md hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300"
    >
      {/* Glow effect background */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/30 via-cyan-400/30 to-blue-400/30 blur-md -z-10 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />

      {/* Search Icon */}
      <motion.img
        src={assets.search_icon}
        alt="search_icon"
        className="md:w-auto w-8 ml-3 select-none"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
      />

      {/* Input Field */}
      <input
        onChange={(e) => setInput(e.target.value)}
        value={input}
        type="text"
        placeholder="Search for courses..."
        className="w-full h-full bg-transparent outline-none px-3 text-gray-700 placeholder-gray-400"
      />

      {/* Search Button */}
      <motion.button
        type="submit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium md:px-8 px-6 md:py-2 py-1.5 rounded-full mx-2 shadow-md hover:shadow-blue-400/40 transition-all duration-300"
      >
        Search
      </motion.button>
    </motion.form>
  );
};

export default SearchBar;
