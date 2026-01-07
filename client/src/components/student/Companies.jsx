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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const Companies = () => {
  return (
    <section className="relative w-full bg-gradient-to-r from-[#f5fbff] via-[#f9fdff] to-[#eef6ff] py-14 px-4 sm:px-8 md:px-16 border-t border-gray-100">
      
      {/* Heading */}
      <h2 className="text-center text-gray-800 font-semibold text-lg sm:text-2xl md:text-3xl mb-12">
        Trusted by professionals from leading organizations
      </h2>

      {/* ================= MOBILE: Smooth infinite scroll ================= */}
      <div className="block md:hidden overflow-hidden w-full relative">
        <motion.div
          className="flex gap-6 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {[...logos, ...logos].map((logo, index) => (
            <div
              key={index}
              className="bg-white rounded-xl w-28 h-16 flex items-center justify-center shadow-sm border border-gray-100"
            >
              <img
                src={logo}
                alt="company logo"
                className="w-20 object-contain opacity-90"
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* ================= DESKTOP: Professional grid ================= */}
      <div className="hidden md:grid max-w-7xl mx-auto grid-cols-5 gap-10 justify-items-center">
        {logos.map((logo, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{
              y: -6,
              boxShadow: "0 14px 30px rgba(0, 140, 255, 0.18)",
            }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 18,
            }}
            className="bg-white/90 backdrop-blur-md border border-blue-100 rounded-2xl 
                       flex items-center justify-center 
                       w-36 h-24 shadow-sm"
          >
            <img
              src={logo}
              alt="company logo"
              className="w-28 object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Companies;