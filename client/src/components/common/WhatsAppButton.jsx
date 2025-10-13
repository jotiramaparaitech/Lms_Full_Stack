import React from "react";
import { motion } from "framer-motion";
import { assets } from "../../assets/assets";

const WhatsAppButton = () => {
  const phoneNumber = "919766085448";
  const message = "Hello! I’d like to know more about Aparaitech Projects.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <motion.div
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex items-center gap-2 sm:gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* 💬 Message Bubble */}
      <motion.div
        className="bg-white text-black px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg shadow-md 
                   text-[10px] sm:text-sm md:text-base font-normal border border-gray-200 
                   cursor-pointer hover:shadow-lg transition-all duration-300"
        whileHover={{ scale: 1 }}
      >
        Need Help? <span className="font-bold">Chat with us</span>
      </motion.div>

      {/* 🟢 WhatsApp Logo Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center transition-all duration-300"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <img
          src={assets.whatsappLogo}
          alt="WhatsApp"
          className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16"
          style={{
            borderRadius: "50%",
            boxShadow: "0px 3px 5px rgba(0,0,0,0.25)",
          }}
        />
      </motion.a>
    </motion.div>
  );
};

export default WhatsAppButton;
