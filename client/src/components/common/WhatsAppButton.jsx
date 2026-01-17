import React from "react";
import { motion } from "framer-motion";
import { assets } from "../../assets/assets";

const WhatsAppButton = () => {
  const phoneNumber = "916364326342";
  const message = "Hello! I’d like to know more about Aparaitech Projects.";
  const defaultUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  const openWhatsApp = () => {
    window.open(defaultUrl, "_blank");
  };

  return (
    <motion.div
      className="
        fixed
        bottom-14 sm:bottom-16 md:bottom-20
        right-2 sm:right-3 md:right-3
        z-50 flex items-center gap-3 px-2
      "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* 💬 Chat bubble */}
      <motion.div
        className="
          hidden sm:block bg-white text-black
          px-3 py-2 rounded-lg shadow-md
          text-xs sm:text-sm font-normal
          border border-gray-200
          cursor-pointer
          hover:shadow-lg transition-all duration-300
        "
        whileHover={{ scale: 1.03 }}
        onClick={openWhatsApp}
      >
        Need Help? <span className="font-bold ml-1">Chat with us</span>
      </motion.div>

      {/* 🟢 WhatsApp Icon */}
      <motion.div
        onClick={openWhatsApp}
        className="flex items-center justify-center cursor-pointer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <img
          src={assets.whatsappLogo}
          alt="WhatsApp"
          className="
            w-11 h-11
            sm:w-14 sm:h-14
            md:w-14 md:h-14
          "
          style={{
            borderRadius: "50%",
            boxShadow: "0px 4px 6px rgba(0,0,0,0.25)",
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default WhatsAppButton;
