import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { UserButton, useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";

const AdminNavbar = () => {
  const { isEducator } = useContext(AppContext);
  const { user } = useUser();

  if (!isEducator || !user) return null;

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 14 }}
      className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-cyan-50 via-sky-100 to-blue-50 
        border-b border-gray-200 backdrop-blur-xl shadow-md"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 sm:px-8 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            src={assets.logo}
            alt="Aparaitech Logo"
            className="w-14 sm:w-16 md:w-20 drop-shadow-md rounded-xl"
          />
          <span className="font-semibold text-gray-800 text-lg sm:text-xl md:text-2xl">
            Aparaitech
          </span>
        </Link>

        {/* Right Section — Greeting and User Avatar */}
        <div className="flex items-center gap-3 sm:gap-6">
          <p className="hidden sm:block text-sm sm:text-base font-medium text-gray-800">
            Hi,{" "}
            <span className="text-blue-700 font-semibold">{user.fullName}</span>
          </p>

          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "w-9 h-9 sm:w-10 sm:h-10 border-2 border-blue-500 rounded-full shadow-md",
              },
            }}
          />
        </div>
      </div>
    </motion.nav>
  );
};

export default AdminNavbar;
