import React from "react";
import { motion } from "framer-motion";
import { assets } from "../../assets/assets";

const WhatsAppButton = () => {
  // ✅ Your WhatsApp business number (no '+' or spaces)
  const phoneNumber = "916364326342";

  // ✅ Pre-filled message
  const message = "Hello! I’d like to know more about Aparaitech Projects.";

  // ✅ Default Click-to-Chat link (works for normal accounts)
  const defaultUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  // ✅ Fallback to Business Short Link (replace XXXX with your own)
  // 👉 You can find this inside WhatsApp Business App → Business Tools → Short link
  const businessShortLink = "https://wa.me/message/XXXXXX"; // ← update this once you copy it

  // ✅ Smart open handler
  const openWhatsApp = () => {
    // Open default URL first
    const newWindow = window.open(defaultUrl, "_blank");

    // Fallback check after a small delay — if message doesn’t show, use short link
    setTimeout(() => {
      if (newWindow && !newWindow.closed) {
        // if WhatsApp Business API blocks text injection, open short link instead
        newWindow.location.href = businessShortLink;
      }
    }, 2500);
  };

  return (
    <motion.div
      className="fixed bottom-6 right-3 sm:bottom-8 sm:right-6 z-[9999] flex items-center gap-2 sm:gap-3 px-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* 💬 Chat bubble */}
      <motion.div
        className="bg-white text-black px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg shadow-md
                   text-[9px] sm:text-sm md:text-base font-normal border border-gray-200
                   cursor-pointer hover:shadow-lg transition-all duration-300"
        whileHover={{ scale: 1 }}
        onClick={openWhatsApp}
      >
        Need Help? <span className="font-bold ml-1">Chat with us</span>
      </motion.div>

      {/* 🟢 WhatsApp Icon */}
      <motion.div
        onClick={openWhatsApp}
        className="flex items-center justify-center transition-all duration-300 cursor-pointer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <img
          src={assets.whatsappLogo}
          alt="WhatsApp"
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
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
