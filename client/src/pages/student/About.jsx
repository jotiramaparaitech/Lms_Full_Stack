import React from "react";
import { motion } from "framer-motion";
import { assets } from "../../assets/assets";
import Footer from "../../components/student/Footer";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-cyan-50 to-white text-center">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-6 py-16">
        <motion.img
          src={assets.logo}
          alt="Aparaitech Logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-28 md:w-36 mb-6"
        />

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-gray-800 mb-4"
        >
          About Aparaitech LMS
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-3xl text-gray-600 leading-relaxed text-lg"
        >
          Aparaitech LMS is an advanced learning management system designed to
          connect educators and students seamlessly. Our mission is to make
          learning more interactive, efficient, and accessible through modern
          technology and intuitive design.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex flex-wrap justify-center gap-10"
        >
          <div className="bg-white shadow-md rounded-2xl p-6 w-72 sm:w-80 hover:shadow-lg transition-all">
            <h3 className="text-xl font-semibold text-cyan-700 mb-2">
              Our Mission
            </h3>
            <p className="text-gray-600 text-sm">
              To provide a smart learning environment that empowers both
              students and educators with the right tools for success.
            </p>
          </div>

          <div className="bg-white shadow-md rounded-2xl p-6 w-72 sm:w-80 hover:shadow-lg transition-all">
            <h3 className="text-xl font-semibold text-cyan-700 mb-2">
              Our Vision
            </h3>
            <p className="text-gray-600 text-sm">
              To revolutionize education by integrating innovation and
              technology into every aspect of the learning experience.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer (Full Width & Responsive) */}
      <footer className="w-full">
        <Footer />
      </footer>
    </div>
  );
};

export default About;
