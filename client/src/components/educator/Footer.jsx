import React from "react";
import { assets } from "../../assets/assets";
import { motion } from "framer-motion";

const Footer = () => {
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
      {/* 🔹 Left Section */}
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

      {/* 🔹 Right Section - Social Icons */}
      <div className="flex items-center gap-4 mt-4 md:mt-0">
        <a href="#" className="transition-all duration-300 hover:scale-110">
          <img
            src={assets.facebook_icon}
            alt="facebook_icon"
            className="w-6 h-6 opacity-80 hover:opacity-100 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
          />
        </a>
        <a href="#" className="transition-all duration-300 hover:scale-110">
          <img
            src={assets.twitter_icon}
            alt="twitter_icon"
            className="w-6 h-6 opacity-80 hover:opacity-100 hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]"
          />
        </a>
        <a href="#" className="transition-all duration-300 hover:scale-110">
          <img
            src={assets.instagram_icon}
            alt="instagram_icon"
            className="w-6 h-6 opacity-80 hover:opacity-100 hover:drop-shadow-[0_0_8px_rgba(147,51,234,0.6)]"
          />
        </a>
      </div>
    </motion.footer>
  );
};

export default Footer;
