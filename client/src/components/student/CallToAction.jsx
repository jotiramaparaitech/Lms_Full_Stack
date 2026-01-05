import React from "react";
import { motion } from "framer-motion";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate

const CallToAction = () => {
  const navigate = useNavigate(); // ✅ Initialize navigation hook

  // ✅ Functions to handle button clicks
  const handleViewProjects = () => {
    navigate("/course-list");
  };

  const handleContactUs = () => {
    navigate("/contact");
  };

  return (
    <section className="relative flex flex-col md:flex-row items-center justify-center min-h-screen w-full px-6 md:px-16 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white overflow-hidden">
      {/* Subtle moving gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-700/30 to-fuchsia-700/30 animate-pulse-slow pointer-events-none"></div>

      {/* Left content */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full md:w-1/2 text-center md:text-left space-y-6"
      >
        <h1 className="md:text-6xl text-4xl font-extrabold leading-tight">
          Transforming Ideas into Impactful Projects 🚀
        </h1>
        <p className="text-gray-300 text-lg md:text-xl max-w-lg">
          From concept to completion, we build next-gen software solutions that
          empower innovation and drive success.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 mt-8 justify-center md:justify-start">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewProjects} // ✅ Added action
            className="px-10 py-4 rounded-full text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:shadow-xl transition-all"
          >
            View Our Projects
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContactUs} // ✅ Added action
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 border border-gray-500/30 text-gray-200 font-semibold hover:text-white hover:bg-white/20 transition-all"
          >
            Contact Us
            <img src={assets.arrow_icon} alt="arrow_icon" className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Right side illustration or image */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full md:w-1/2 flex justify-center mt-12 md:mt-0"
      >
        <img
          src="https://res.cloudinary.com/dfytp36ni/image/upload/v1760176931/Gemini_Generated_Image_51un2h51un2h51un_aqv1tx.png"
          alt="Company innovation illustration"
          className="w-3/4 max-w-lg drop-shadow-2xl rounded-3xl hover:scale-105 transition-transform duration-500"
        />
      </motion.div>
    </section>
  );
};

export default CallToAction;
