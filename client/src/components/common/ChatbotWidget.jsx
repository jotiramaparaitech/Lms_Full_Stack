import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { assets } from "../../assets/assets";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 sm:gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chatbox"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200"
            style={{
              width: "90vw",
              maxWidth: "360px",
              height: "60vh",
              marginBottom: "0.5rem",
            }}
          >
            <iframe
              src={`https://www.chatbase.co/chatbot-iframe/YOUR_CHATBASE_AGENT_ID`}
              title="Aparaitech Chatbot"
              width="100%"
              height="100%"
              style={{ border: "none" }}
              allow="microphone; clipboard-read; clipboard-write;"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="rounded-full bg-blue-600 hover:bg-blue-700 p-2 sm:p-3 shadow-lg flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14"
      >
        {isOpen ? (
          <X className="text-white w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <MessageCircle className="text-white w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </motion.button>

      {/* WhatsApp Button (always at bottom)
      <motion.a
        href="https://wa.me/919766085448?text=Hello!%20I’d%20like%20to%20know%20more%20about%20Aparaitech%20Projects."
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mt-2"
      >
        <img
          src={assets.whatsappLogo}
          alt="WhatsApp"
          className="w-full h-full object-contain rounded-full"
          style={{ boxShadow: "0 4px 12px rgba(37, 211, 102, 0.5)" }}
        />
      </motion.a> */}
    </motion.div>
  );
};

export default ChatbotWidget;
