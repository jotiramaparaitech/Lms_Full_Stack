import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SideBar from "../../components/educator/SideBar";
import Navbar from "../../components/educator/Navbar";
import Footer from "../../components/educator/Footer";
import { motion, AnimatePresence } from "framer-motion";

const Educator = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = (state) => {
    if (typeof state === "boolean") setIsSidebarOpen(state);
    else setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50">
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 pt-[80px]">
        {/* Sidebar */}
        <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`flex-1 px-5 sm:px-8 md:px-10 lg:px-16 py-6 transition-all duration-500 ${
              isSidebarOpen && window.innerWidth >= 768 ? "md:ml-64" : "ml-0"
            }`}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Educator;
