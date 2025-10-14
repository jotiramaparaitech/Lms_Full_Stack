import React from "react";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { assets } from "../../assets/assets";

const AdminFooter = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full border-t border-gray-200/60 
        bg-gradient-to-r from-cyan-50 via-sky-100 to-blue-50 
        backdrop-blur-md shadow-[0_-4px_15px_rgba(0,0,0,0.05)] 
        px-6 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <img
          className="hidden md:block w-20 rounded-lg"
          src={assets.logo}
          alt="logo"
        />
        <div className="hidden md:block h-7 w-px bg-gray-400/50"></div>
        <p className="text-xs md:text-sm text-gray-600">
          © 2025 <span className="font-semibold text-blue-600">Aparaitech</span>
          . All rights reserved.
        </p>
      </div>

      {/* Right Section - Social Icons */}
      <div className="flex items-center gap-4 mt-4 md:mt-0">
        <a
          href="https://www.linkedin.com/company/aparaitech"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-all duration-300 hover:scale-110 text-blue-700"
        >
          <FaLinkedinIn size={24} />
        </a>

        <a
          href="https://www.youtube.com/@Aparaitech"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-all duration-300 hover:scale-110 text-red-600"
        >
          <FaYoutube size={24} />
        </a>

        <a
          href="https://www.instagram.com/aparaitech_global/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-all duration-300 hover:scale-110 text-purple-600"
        >
          <FaInstagram size={24} />
        </a>

        <a
          href="https://www.facebook.com/yourpage"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-all duration-300 hover:scale-110 text-blue-600"
        >
          <FaFacebookF size={24} />
        </a>

        <a
          href="https://twitter.com/yourprofile"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-all duration-300 hover:scale-110 text-sky-400"
        >
          <FaTwitter size={24} />
        </a>
      </div>
    </motion.footer>
  );
};

export default AdminFooter;
