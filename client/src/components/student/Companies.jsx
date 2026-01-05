import React from "react";
import { motion } from "framer-motion";
import { assets } from "../../assets/assets";

const logos = [
  assets.microsoft_logo,
  assets.walmart_logo,
  assets.accenture_logo,
  assets.adobe_logo,
  assets.paypal_logo,
  assets.amazon_logo,
  assets.meta_logo,
  assets.salesforce_logo,
  assets.oracle_logo,
  assets.qualcomm_logo,
];

const Companies = () => {
  return (
    <section className="relative w-full bg-gradient-to-r from-[#f4fbff] via-[#f9feff] to-[#eef7ff] py-14 px-4 sm:px-8 md:px-16 border-t border-gray-100">
      <h2 className="text-center text-gray-800 font-extrabold text-lg sm:text-2xl md:text-3xl tracking-wide mb-12">
        🌎 Trusted by learners from world-class companies
      </h2>

      {/* ================= MOBILE: Auto moving logos (Right → Left) ================= */}
      <div className="block md:hidden overflow-hidden w-full relative">
        <motion.div
          className="flex gap-6 w-max"
          initial={{ x: 300 }}
          animate={{ x: -1000 }}
          transition={{
            duration: 18,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {[...logos, ...logos].map((logo, index) => (
            <div
              key={index}
              className="bg-white rounded-xl w-28 h-16 flex items-center justify-center shadow-md"
            >
              <img
                src={logo}
                alt="company logo"
                className="w-20 object-contain"
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* ================= DESKTOP: Static grid ================= */}
      <div className="hidden md:grid max-w-7xl mx-auto grid-cols-5 gap-10 justify-items-center">
        {logos.map((logo, index) => (
          <motion.div
            key={index}
            whileHover={{
              scale: 1.1,
              rotate: [0, -2, 2, 0],
              boxShadow: "0 12px 28px rgba(0, 160, 255, 0.25)",
            }}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 15,
            }}
            className="bg-white/90 backdrop-blur-md border border-blue-100 rounded-2xl 
                       flex items-center justify-center 
                       w-36 h-24 shadow-md"
          >
            <img
              src={logo}
              alt="company logo"
              className="w-28 object-contain"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Companies;
