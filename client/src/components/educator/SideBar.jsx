import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { X } from "lucide-react";

const SideBar = () => {
  const { isEducator } = useContext(AppContext);
  const [visible, setVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // ✅ mobile menu state

  const menuItems = [
    { name: "Dashboard", path: "/educator", icon: assets.home_icon },
    {
      name: "Add Project",
      path: "/educator/add-course",
      icon: assets.add_icon,
    },
    {
      name: "My Project",
      path: "/educator/my-courses",
      icon: assets.my_course_icon,
    },
    {
      name: "Student Enrolled",
      path: "/educator/student-enrolled",
      icon: assets.person_tick_icon,
    },
    // ✅ NEW MENU ITEM ADDED BELOW (no other changes)
    {
      name: "Assign Projects",
      path: "/educator/assign-course",
      icon: assets.my_course_icon,
    },
    {
      name: "Support Tickets",
      path: "/educator/tickets",
      icon: assets.support, 
    },
// ✅ NEW MENU ITEMS
    {
      name: "Assign Team Leader",
      path: "/educator/assign-team-leader",
      icon: assets.person_tick_icon, 
    },
    {
      name: "Team Leaders",
      path: "/educator/team-leaders",
      icon: assets.people_icon || assets.person_tick_icon, // Use existing icon or fallback
    },
    {
      name: "Student Dashboard",
      path: "/student/dashboard",
      icon: assets.person_tick_icon,
    },
  ];

  useEffect(() => {
    setTimeout(() => setVisible(true), 150);

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsCollapsed(window.innerWidth < 1024 && !isMobile);
      if (isMobile) setIsMobileOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isEducator) return null;

  return (
    <>
      {/* ✅ Mobile Toggle Button (bottom-right floating button) */}
      <button
        className="md:hidden fixed bottom-20 left-5 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg active:scale-95 transition-transform"
        onClick={() => setIsMobileOpen(true)}
      >
        ☰
      </button>

      {/* ✅ Overlay for Mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* ✅ Sidebar */}
      <AnimatePresence>
        {(isMobileOpen || window.innerWidth >= 768) && (
          <motion.aside
            key="sidebar"
            initial={{ x: isMobileOpen ? -300 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`fixed md:static top-0 left-0 z-50 md:z-20 min-h-screen
              bg-gradient-to-b from-cyan-50 via-sky-100 to-blue-50
              backdrop-blur-xl shadow-lg border-r border-gray-200 flex flex-col
              py-8 px-3 transition-all duration-500 ease-in-out
              ${isCollapsed ? (isHovered ? "w-64" : "w-20") : "w-64"}`}
          >
            {/* ✅ Mobile Close Button */}
            <div className="flex justify-end mb-4 md:hidden">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 bg-white/70 rounded-full shadow hover:scale-105 transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* ✅ Menu Items */}
            {visible && (
              <motion.nav
                className="flex flex-col gap-5 mt-4"
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.07 * index, duration: 0.4 }}
                  >
                    <NavLink
                      to={item.path}
                      end={item.path === "/educator"}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        `group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold
                        transition-all duration-400 relative overflow-hidden
                        ${
                          isActive
                            ? "bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-200 text-white shadow-[0_6px_20px_rgba(0,150,255,0.3)]"
                            : "bg-white/80 text-gray-700 hover:bg-gradient-to-r hover:from-cyan-100 hover:via-sky-100 hover:to-blue-100 hover:text-blue-800 shadow-md hover:shadow-[0_4px_18px_rgba(0,150,255,0.25)]"
                        }`
                      }
                    >
                      <motion.img
                        src={item.icon}
                        alt={item.name}
                        className="w-6 h-6 drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                      />
                      <span
                        className={`whitespace-nowrap tracking-wide transition-all duration-300 ${
                          isCollapsed && !isHovered
                            ? "opacity-0 w-0 overflow-hidden"
                            : "opacity-100"
                        }`}
                      >
                        {item.name}
                      </span>
                    </NavLink>
                  </motion.div>
                ))}
              </motion.nav>
            )}

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-300 animate-glow" />
            <style>{`
              @keyframes glow {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
              }
              .animate-glow {
                background-size: 200% 200%;
                animation: glow 6s ease infinite;
              }
            `}</style>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default SideBar;
