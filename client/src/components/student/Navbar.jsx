import React, { useContext, useEffect, useState, createContext } from "react";
import { assets } from "../../assets/assets";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

// Context for AllProjects state
export const AllProjectsContext = createContext();

const Navbar = () => {
  const location = useLocation();
  const isCoursesListPage = location.pathname.includes("/course-list");

  const { navigate } = useContext(AppContext);
  const { openSignIn } = useClerk();
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

  // Educator Access Handler
  const handleEducatorAccess = () => {
    if (userRole === "educator" || userRole === "admin") {
      navigate("/educator");
    } else {
      toast.info("You need educator access to open this dashboard.");
    }
  };

  // Scroll to Footer Handler
  const handleScrollToFooter = () => {
    const footer = document.getElementById("contact-section");
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById("contact-section");
        section?.scrollIntoView({ behavior: "smooth" });
      }, 400);
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
              to="/course-list"
              className="hover:text-cyan-700 transition-colors duration-200"
            >
              Projects
            </Link>

            {/* All Project Button - Available on all pages */}
            <motion.button
              onClick={() => setIsAllProjectsOpen(true)}
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isAllProjectsOpen
                  ? "bg-cyan-600 text-white shadow-md"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-sm hover:shadow-md"
              }`}
            >
              All Project
            </motion.button>

            {/* Contact Us Link */}
            <Link
              to="/contact"
              className="hover:text-cyan-700 transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>

          {user && (
            <div className="flex items-center flex-wrap gap-5 ml-6">
              {(userRole === "educator" || userRole === "admin") && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="hover:text-cyan-700 transition-colors duration-200"
                  onClick={handleEducatorAccess}
                >
                  Admin Dashboard
                </motion.button>
              )}

              {(userRole === "student" || userRole === "admin") && (
                 <Link
                   to="/student/dashboard"
                   className="hover:text-cyan-700 transition-colors duration-200"
                 >
                  Student Dashboard
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
              to="/course-list"
              onClick={() => setMenuOpen(false)}
              className="hover:text-cyan-700 transition-colors"
            >
              Projects
            </Link>

            {/* All Project Button - Mobile (available on all pages) */}
            <button
              onClick={() => {
                setIsAllProjectsOpen(true);
                setMenuOpen(false);
              }}
              className={`text-left px-4 py-2 rounded-lg transition-all ${
                isAllProjectsOpen
                  ? "bg-cyan-600 text-white"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
              }`}
            >
              All Project
            </button>

            {/* Contact Us Link */}
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
                    Admin Dashboard
                  </button>
                )}

                {(userRole === "student" || userRole === "admin") && (
                    <Link
                      to="/student/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="hover:text-cyan-700 transition-colors"
                    >
                     Student Dashboard
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
