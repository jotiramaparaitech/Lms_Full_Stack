import React, { useContext, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import axios from "axios";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react"; // ✅ For mobile toggle icon

const Navbar = () => {
  const location = useLocation();
  const isCoursesListPage = location.pathname.includes("/course-list");

  const { backendUrl, isEducator, setIsEducator, navigate, getToken } =
    useContext(AppContext);
  const { openSignIn } = useClerk();
  const { user } = useUser();

  const [isFixed, setIsFixed] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false); // ✅ For mobile menu toggle

  useEffect(() => {
    const timer = setTimeout(() => setIsFixed(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const becomeEducator = async () => {
    try {
      if (isEducator) {
        navigate("/educator");
        return;
      }

      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/educator/update-role`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEducator(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 15 }}
      className={`${
        isFixed ? "fixed top-0" : "sticky top-0"
      } left-0 w-full z-50 transition-all duration-700 backdrop-blur-lg shadow-md ${
        isCoursesListPage
          ? "bg-white"
          : "bg-gradient-to-r from-cyan-50 via-cyan-100 to-cyan-50"
      }`}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between flex-wrap px-4 sm:px-8 md:px-14 lg:px-20 py-2">
        {/* 🔹 Logo Section (Static) */}
        <div
          className="flex items-center flex-shrink-0 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <motion.img
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            src={assets.logo}
            alt="Aparaitech Logo"
            className="w-16 sm:w-20 md:w-24 drop-shadow-lg transition-all duration-300"
          />
          <span
            className="ml-2 font-semibold text-gray-800 tracking-wide 
              text-lg sm:text-xl md:text-2xl lg:text-3xl whitespace-nowrap"
          >
            Aparaitech
          </span>
        </div>

        {/* 🔹 Hamburger Icon (Mobile Only) */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-cyan-100 transition-all duration-300"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>

        {/* 🔹 Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <div className="flex items-center flex-wrap gap-6">
            <Link
              to="/"
              className="hover:text-cyan-700 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="hover:text-cyan-700 transition-colors duration-200"
            >
              About Us
            </Link>
            <Link
              to="/projects"
              className="hover:text-cyan-700 transition-colors duration-200"
            >
              Projects
            </Link>
            <Link
              to="/contact"
              className="hover:text-cyan-700 transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>

          {user && (
            <div className="flex items-center flex-wrap gap-5 ml-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="hover:text-cyan-700 transition-colors duration-200"
                onClick={becomeEducator}
              >
                {isEducator ? "Educator Dashboard" : "Become Educator"}
              </motion.button>
              <span className="text-gray-300">|</span>
              <Link
                to="/my-enrollments"
                className="hover:text-cyan-700 transition-colors duration-200"
              >
                My Enrollments
              </Link>
            </div>
          )}

          {user ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openSignIn()}
              className="bg-cyan-600 text-white px-5 py-2 rounded-full shadow-md hover:shadow-xl hover:bg-cyan-700 transition-all duration-300"
            >
              Create Account
            </motion.button>
          )}
        </div>

        {/* 🔹 Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden w-full mt-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 flex flex-col gap-4 text-gray-700 font-medium">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="hover:text-cyan-700 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="hover:text-cyan-700 transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/projects"
              onClick={() => setMenuOpen(false)}
              className="hover:text-cyan-700 transition-colors"
            >
              Projects
            </Link>
            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="hover:text-cyan-700 transition-colors"
            >
              Contact Us
            </Link>

            {user && (
              <>
                <button
                  onClick={() => {
                    becomeEducator();
                    setMenuOpen(false);
                  }}
                  className="hover:text-cyan-700 text-left"
                >
                  {isEducator ? "Educator Dashboard" : "Become Educator"}
                </button>
                <Link
                  to="/my-enrollments"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-cyan-700 transition-colors"
                >
                  My Enrollments
                </Link>
              </>
            )}

            {user ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <button
                onClick={() => {
                  openSignIn();
                  setMenuOpen(false);
                }}
                className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-all"
              >
                Create Account
              </button>
            )}
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
