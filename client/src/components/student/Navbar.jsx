// 📁 src/components/student/Navbar.jsx
import React, { useContext, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const isCoursesListPage = location.pathname.includes("/course-list");

  const { backendUrl, navigate } = useContext(AppContext);
  const { openSignIn } = useClerk();
  const { user, isLoaded } = useUser();

  const [isFixed, setIsFixed] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsFixed(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const userRole = user?.publicMetadata?.role || "student";

  const handleEducatorAccess = () => {
    if (userRole === "educator" || userRole === "admin") {
      navigate("/educator");
    } else {
      toast.info("You need educator access to open this dashboard.");
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
        {/* Logo */}
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
          <span className="ml-2 font-semibold text-gray-800 tracking-wide text-lg sm:text-xl md:text-2xl lg:text-3xl whitespace-nowrap">
            Aparaitech
          </span>
        </div>

        {/* Mobile Toggle */}
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

        {/* Desktop Menu */}
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
              {/* Educator/Admin button - only visible for educator/admin */}
              {(userRole === "educator" || userRole === "admin") && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="hover:text-cyan-700 transition-colors duration-200"
                  onClick={handleEducatorAccess}
                >
                  Educator Dashboard
                </motion.button>
              )}

              {/* Student-only link */}
              {userRole === "student" && (
                <Link
                  to="/my-enrollments"
                  className="hover:text-cyan-700 transition-colors duration-200"
                >
                  My Enrollments
                </Link>
              )}
            </div>
          )}

          {/* User Button / Sign In */}
          {user ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openSignIn()}
              className="bg-cyan-600 text-white px-5 py-2 rounded-full shadow-md hover:shadow-xl hover:bg-cyan-700 transition-all duration-300"
            >
              Sign In
            </motion.button>
          )}
        </div>

        {/* Mobile Dropdown Menu */}
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
                {(userRole === "educator" || userRole === "admin") && (
                  <button
                    onClick={() => {
                      handleEducatorAccess();
                      setMenuOpen(false);
                    }}
                    className="hover:text-cyan-700 text-left"
                  >
                    Educator Dashboard
                  </button>
                )}

                {userRole === "student" && (
                  <Link
                    to="/my-enrollments"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-cyan-700 transition-colors"
                  >
                    My Enrollments
                  </Link>
                )}
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
                Sign In
              </button>
            )}
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
