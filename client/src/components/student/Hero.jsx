import React from "react";
import { motion } from "framer-motion";
import { assets } from "../../assets/assets";
import SearchBar from "../../components/student/SearchBar";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      className="relative w-full min-h-screen flex items-center bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `url(${assets.hero_bg})`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"></div>

      {/* CONTENT */}
      <div className="relative w-full max-w-[1400px] mx-auto flex flex-col-reverse md:flex-row items-center justify-between px-6 sm:px-10 md:px-16 lg:px-24 py-16 md:py-24 lg:py-32">
        {/* LEFT SECTION */}
        <div className="flex-1 text-left z-10">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-800 leading-tight"
          >
            Master <span className="text-cyan-700">Modern Learning</span> with{" "}
            <span className="text-cyan-600">Aparaitech</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-700 mt-5 text-base sm:text-lg max-w-lg"
          >
            The comprehensive LMS platform to learn coding, design, and
            technology — anytime, anywhere, and at your own pace.
          </motion.p>

          {/* CTA BUTTONS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4 mt-8"
          >
            <Link to="/course-list">
              <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 sm:px-8 py-3 rounded-md font-medium shadow-md transition-all duration-300">
                Start Learning Today
              </button>
            </Link>

            {/* <Link to="/course-list">
              <button className="border border-cyan-500 text-cyan-600 hover:bg-cyan-50 px-6 sm:px-8 py-3 rounded-md font-medium transition-all duration-300">
                Free Resources
              </button>
            </Link> */}
          </motion.div>
          {/* FEATURES */}
          <div className="flex items-center gap-6 mt-6 text-sm text-gray-600">
            {/* <div className="flex items-center gap-2">
              <img src={assets.check_icon} alt="check" className="w-4 h-4" />
              <span>Free Registration</span>
            </div> */}
            <div className="flex items-center gap-2">
              <img src={assets.check_icon} alt="check" className="w-4 h-4" />
              <span>Certificates</span>
            </div>
          </div>

          {/* SEARCH BAR */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
            className="mt-10 max-w-lg"
          >
            <SearchBar />
          </motion.div>
        </div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            type: "spring",
            stiffness: 120,
          }}
          className="flex-1 flex justify-center md:justify-end mb-10 md:mb-0 z-10"
        >
          <div className="relative w-full flex justify-center">
            <img
              src={assets.hero_img}
              alt="Learning Illustration"
              className="w-[100%] md:w-[95%] lg:w-[90%] max-w-[880px] h-auto rounded-3xl shadow-2xl object-cover transition-transform duration-500 hover:scale-[1]"
            />

            {/* Floating Badge */}
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-2">
              <img
                src={assets.success_icon}
                alt="success"
                className="w-9 h-9 text-green-600"
              />
              <span className="text-sm font-semibold text-gray-700">
                10,000+ Success Stories
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
