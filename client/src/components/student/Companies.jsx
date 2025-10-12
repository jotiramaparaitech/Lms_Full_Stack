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
      {/* Glow effect container */}
      <motion.div
        whileHover={{
          background:
            "linear-gradient(90deg, rgba(165,243,252,0.3), rgba(191,219,254,0.3), rgba(219,234,254,0.3))",
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="rounded-3xl p-8 sm:p-10"
      >
        {/* Heading */}
        <h2 className="text-center text-gray-800 font-extrabold text-lg sm:text-2xl md:text-3xl tracking-wide mb-12">
          🌎 Trusted by learners from world-class companies
        </h2>

        {/* Logos grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 md:gap-10 justify-items-center">
          {logos.map((logo, index) => (
            <motion.div
              key={index}
              whileHover={{
                scale: 1.1,
                rotate: [0, -2, 2, 0],
                boxShadow: "0 12px 28px rgba(0, 160, 255, 0.25)",
                backgroundColor: "rgba(240, 249, 255, 0.9)",
              }}
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 15,
                duration: 0.6,
              }}
              className="bg-white/90 backdrop-blur-md border border-blue-100 rounded-2xl 
                         flex items-center justify-center 
                         w-28 sm:w-32 md:w-36 lg:w-40 h-16 sm:h-20 md:h-24 lg:h-28 
                         shadow-md hover:shadow-lg transition-all duration-300"
            >
              <img
                src={logo}
                alt={`Company ${index}`}
                className="w-20 sm:w-24 md:w-28 lg:w-32 h-auto object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Companies;
