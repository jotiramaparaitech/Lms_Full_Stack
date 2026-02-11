import React, { useContext, useEffect, useState, createContext } from "react";
import { assets } from "../../assets/assets";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react"; // Added LogOut icon for better UI

// Context for AllProjects state
export const AllProjectsContext = createContext();

const Navbar = () => {
  const location = useLocation();
  const isCoursesListPage = location.pathname.includes("/course-list");

  const { navigate } = useContext(AppContext);
  // 1. Destructured signOut here
  const { openSignIn, signOut } = useClerk();
  const { user } = useUser();
  const { isAllProjectsOpen, setIsAllProjectsOpen } =
    useContext(AllProjectsContext);

  const [isFixed, setIsFixed] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsFixed(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const userRole = user?.publicMetadata?.role || "student";

  // Check if a nav item is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Active style for desktop nav items (box style) - EXCLUDES "All Project"
  const getNavItemStyle = (path) => {
    const active = isActive(path);
    return `px-4 py-2 rounded-lg transition-all duration-200 ${active
      ? "bg-cyan-600 text-white shadow-md font-semibold"
      : "text-gray-700 hover:text-cyan-700 hover:bg-cyan-50"
      }`;
  };

  // Active style for mobile nav items - EXCLUDES "All Project"
  const getMobileNavItemStyle = (path) => {
    const active = isActive(path);
    return `px-4 py-3 rounded-lg transition-all duration-200 ${active
      ? "bg-cyan-600 text-white font-semibold"
      : "text-gray-700 hover:bg-cyan-50"
      }`;
  };

  // Educator Access Handler
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
      className={`${isFixed ? "fixed top-0" : "sticky top-0"
        } left-0 w-full z-50 transition-all duration-700 backdrop-blur-lg shadow-md ${isCoursesListPage
          ? "bg-white"
          : "bg-gradient-to-r from-cyan-50 via-cyan-100 to-cyan-50"
        }`}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between flex-wrap px-4 sm:px-8 md:px-14 lg:px-20 py-2.5">
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
            className="w-12 sm:w-14 md:w-16 drop-shadow-lg transition-all duration-300"
          />
          <span className="ml-2 font-semibold text-gray-800 tracking-wide text-base sm:text-lg md:text-xl lg:text-2xl whitespace-nowrap">
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
        <div className="hidden md:flex items-center gap-4 text-gray-700 font-medium">
          <div className="flex items-center flex-wrap gap-2">
            <Link
              to="/"
              className={getNavItemStyle("/")}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={getNavItemStyle("/about")}
            >
              About Us
            </Link>
            <Link
              to="/course-list"
              className={getNavItemStyle("/course-list")}
            >
              Projects
            </Link>

            {/* All Project Button - PLAIN TEXT without box styling */}
            <motion.button
              onClick={() => setIsAllProjectsOpen(true)}
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 font-medium transition-colors duration-200
    text-gray-700 hover:text-cyan-700 ${isAllProjectsOpen ? "text-cyan-700 font-semibold" : ""
                }`}
            >
              All Project
            </motion.button>


            {/* Contact Us Link */}
            <Link
              to="/contact"
              className={getNavItemStyle("/contact")}
            >
              Contact Us
            </Link>
          </div>

          {user && (
            <div className="flex items-center flex-wrap gap-2 ml-4">
              {(userRole === "educator" || userRole === "admin") && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEducatorAccess}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${location.pathname === "/educator" || location.pathname.startsWith("/educator")
                    ? "bg-cyan-600 text-white shadow-md font-semibold"
                    : "text-gray-700 hover:text-cyan-700 hover:bg-cyan-50"
                    }`}
                >
                  Admin Dashboard
                </motion.button>
              )}

              {(userRole === "student" || userRole === "admin") && (
                <Link
                  to="/student/dashboard"
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${location.pathname.startsWith("/student/dashboard")
                    ? "bg-cyan-600 text-white shadow-md font-semibold"
                    : "text-gray-700 hover:text-cyan-700 hover:bg-cyan-50"
                    }`}
                >
                  Student Dashboard
                </Link>
              )}
            </div>
          )}

          {/* User Button / Sign In */}
          {user ? (
            <div className="ml-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openSignIn()}
              className="ml-4 bg-cyan-600 text-white px-5 py-2 rounded-lg shadow-md hover:shadow-xl hover:bg-cyan-700 transition-all duration-300"
            >
              Sign In
            </motion.button>
          )}
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden w-full mt-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 flex flex-col gap-2 text-gray-700 font-medium">
            {/* ✅ MOBILE USER INFO */}
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 mb-2">
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-sm font-semibold text-gray-800">
                  {user.fullName || user.firstName || "User"}
                </span>
              </div>
            )}

            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className={getMobileNavItemStyle("/")}
            >
              Home
            </Link>

            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className={getMobileNavItemStyle("/about")}
            >
              About Us
            </Link>

            <Link
              to="/course-list"
              onClick={() => setMenuOpen(false)}
              className={getMobileNavItemStyle("/course-list")}
            >
              Projects
            </Link>

            {/* All Project Button - Mobile */}
            <button
              onClick={() => {
                setIsAllProjectsOpen(true);
                setMenuOpen(false);
              }}
              className="px-4 py-3 text-left transition-colors
             text-gray-700 hover:text-cyan-700"
            >
              All Project
            </button>


            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className={getMobileNavItemStyle("/contact")}
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
                    className={`px-4 py-3 rounded-lg text-left transition-all duration-200 ${location.pathname === "/educator" || location.pathname.startsWith("/educator")
                      ? "bg-cyan-600 text-white font-semibold"
                      : "text-gray-700 hover:bg-cyan-50"
                      }`}
                  >
                    Admin Dashboard
                  </button>
                )}

                {(userRole === "student" || userRole === "admin") && (
                  <Link
                    to="/student/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname.startsWith("/student/dashboard")
                      ? "bg-cyan-600 text-white font-semibold"
                      : "text-gray-700 hover:bg-cyan-50"
                      }`}
                  >
                    Student Dashboard
                  </Link>
                )}

                {/* 2. ADDED SIGNOUT BUTTON HERE FOR MOBILE */}
                <button
                  onClick={() => {
                    signOut();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            )}

            {/* Sign In button for mobile when user is not logged in */}
            {!user && (
              <motion.button
                onClick={() => {
                  openSignIn();
                  setMenuOpen(false);
                }}
                className="mt-2 bg-cyan-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-cyan-700 transition-all duration-300 text-center"
              >
                Sign In
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.nav>
  );
};

// Provider component to wrap app
export const AllProjectsProvider = ({ children }) => {
  const [isAllProjectsOpen, setIsAllProjectsOpen] = useState(false);

  return (
    <AllProjectsContext.Provider
      value={{ isAllProjectsOpen, setIsAllProjectsOpen }}
    >
      {children}
    </AllProjectsContext.Provider>
  );
};

export default Navbar;