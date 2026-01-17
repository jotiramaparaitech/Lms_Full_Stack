import React, { useState, useEffect, useContext } from 'react';
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Award,
  TrendingUp,
  Menu,
  X,
  Home,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle
} from "lucide-react";
import { AppContext } from "../../context/AppContext";

const StudentSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHamburger, setShowHamburger] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Get user data from context
  const { userData, enrolledCourses = [] } = useContext(AppContext) || {};

  const menuItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      path: "/student/dashboard"
    },
    {
      icon: <FolderKanban size={20} />,
      label: "My Projects",
      path: "/student/projects"
    },
    {
      icon: <ClipboardList size={20} />,
      label: "Tests & Assessments",
      path: "/student/tests"
    },
    {
      icon: <Award size={20} />,
      label: "Certificates",
      path: "/student/certificates"
    },
    {
      icon: <TrendingUp size={20} />,
      label: "Progress Tracker",
      path: "/student/progress"
    }
  ];

  // Calculate user progress
  const calculateUserProgress = () => {
    if (!enrolledCourses || enrolledCourses.length === 0) {
      return {
        progressPercentage: 0,
        completedCourses: 0,
        totalCourses: 0
      };
    }

    // This is a simplified calculation - you should implement based on your CourseProgress model
    const completedCourses = enrolledCourses.filter(course => 
      course.completed === true
    ).length;

    const totalCourses = enrolledCourses.length;
    const progressPercentage = totalCourses > 0 
      ? Math.round((completedCourses / totalCourses) * 100)
      : 0;

    return {
      progressPercentage,
      completedCourses,
      totalCourses
    };
  };

  const userProgress = calculateUserProgress();
  const userDisplayName = userData?.name || 'Student';
  const userEmail = userData?.email || '';
  
  // Extract batch/domain from email or user data
  const getUserDomain = () => {
    if (userEmail) {
      const domain = userEmail.split('@')[1];
      if (domain) {
        // Extract organization name from domain
        const orgName = domain.split('.')[0];
        return orgName.charAt(0).toUpperCase() + orgName.slice(1) + ' Batch';
      }
    }
    return "Web Development Batch"; // Default
  };

  const getUserBatch = () => {
    // You can customize this based on your user data structure
    return userData?.batch || getUserDomain();
  };

  // Handle scroll to hide/show hamburger button
  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        
        if (window.innerWidth < 1024) { // Mobile
          if (currentScrollY > lastScrollY && currentScrollY > 50) {
            setShowHamburger(false);
          } else if (currentScrollY < lastScrollY) {
            setShowHamburger(true);
          }
        }
        
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('aside')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Mobile Hamburger Button - BELOW navbar */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className={`
          lg:hidden fixed z-50 p-3
          bg-gradient-to-r from-cyan-600 to-teal-500 
          text-white rounded-full shadow-xl hover:shadow-2xl 
          transition-all duration-300 hover:scale-110 active:scale-95
          top-20 left-4
          ${mobileMenuOpen ? 'opacity-0 pointer-events-none' : 
            showHamburger ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }
        `}
      >
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar - BELOW navbar */}
      <aside className={`
        hidden lg:flex fixed top-16 left-0 h-[calc(100vh-4rem)] z-20
        bg-gradient-to-b from-white to-cyan-50 
        shadow-lg transition-all duration-500 ease-in-out
        ${isOpen ? 'w-64' : 'w-20'}
      `}>
        <div className="flex flex-col h-full w-full">
          {/* User Profile - START */}
          <div className="p-4 border-b border-cyan-100 bg-gradient-to-r from-white to-cyan-50/50">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  {userData?.imageUrl ? (
                    <img 
                      src={userData.imageUrl} 
                      alt={userDisplayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-md ${
                  userProgress.progressPercentage === 100 ? 'bg-green-500' : 
                  userProgress.progressPercentage > 0 ? 'bg-yellow-500' : 'bg-gray-400'
                }`}></div>
              </div>
              
              {isOpen && (
                <div className="overflow-hidden">
                  <h3 className="font-bold text-gray-900 whitespace-nowrap truncate">
                    {userDisplayName}
                  </h3>
                  <p className="text-xs text-gray-600 truncate">
                    {getUserBatch()}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-700 ease-out ${
                          userProgress.progressPercentage === 100 ? 'bg-green-500' :
                          'bg-gradient-to-r from-cyan-500 to-teal-400'
                        }`}
                        style={{ width: `${userProgress.progressPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-cyan-700">{userProgress.progressPercentage}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <CheckCircle size={10} className={userProgress.completedCourses > 0 ? 'text-green-500' : 'text-gray-400'} />
                      {userProgress.completedCourses} completed
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={10} className="text-gray-400" />
                      {userProgress.totalCourses} enrolled
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* User Profile - END */}

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  end={item.path === "/student/dashboard"}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3.5 rounded-xl 
                    transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md
                    border border-transparent hover:border-cyan-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-lg border-cyan-500' 
                      : 'text-gray-800 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-white hover:text-cyan-700'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <span className={`transition-all duration-300 ${isActive ? 'scale-110 rotate-3' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </span>
                      {isOpen && (
                        <span className="whitespace-nowrap font-medium">
                          {item.label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-cyan-100 bg-gradient-to-r from-white to-cyan-50 space-y-3">
            <NavLink
              to="/"
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300
                hover:scale-[1.02] hover:shadow-sm
                ${isActive 
                  ? 'text-cyan-700 bg-gradient-to-r from-cyan-100 to-white border border-cyan-200' 
                  : 'text-gray-700 hover:text-cyan-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-white'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Home size={18} className={isActive ? 'text-cyan-600' : 'text-gray-600'} />
                  {isOpen && <span className="font-medium">Back to Home</span>}
                </>
              )}
            </NavLink>

            <button 
              onClick={() => {
                // Add your logout logic here
                window.location.href = '/';
              }}
              className="flex items-center gap-3 px-4 py-2.5 w-full text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-md border border-transparent hover:border-red-300"
            >
              <LogOut size={18} />
              {isOpen && <span className="font-medium">Logout</span>}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center w-full p-3 mt-2 text-cyan-700 hover:text-white hover:bg-gradient-to-r hover:from-cyan-600 hover:to-teal-500 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-cyan-200 hover:border-transparent group"
            >
              {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              {isOpen && <span className="ml-2 text-sm font-medium">Collapse Menu</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Menu - STARTS BELOW navbar */}
      <aside className={`
        lg:hidden fixed top-16 left-0 h-[calc(100vh-4rem)] z-50
        bg-gradient-to-b from-white to-cyan-50 
        shadow-2xl transition-transform duration-300 ease-in-out
        w-64
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* User Profile Section */}
          <div className="p-4 border-b border-cyan-100 bg-gradient-to-r from-white to-cyan-50/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-cyan-600 to-teal-500 p-2 rounded-lg shadow-lg">
                  <Award size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-cyan-800">
                    Student Portal
                  </h2>
                  <p className="text-xs text-cyan-600">
                    {userProgress.totalCourses} Active Projects
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-cyan-600 hover:text-cyan-800 hover:bg-cyan-100 p-2 rounded-full transition-all duration-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  {userData?.imageUrl ? (
                    <img 
                      src={userData.imageUrl} 
                      alt={userDisplayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-md ${
                  userProgress.progressPercentage === 100 ? 'bg-green-500' : 
                  userProgress.progressPercentage > 0 ? 'bg-yellow-500' : 'bg-gray-400'
                }`}></div>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900">
                  {userDisplayName}
                </h3>
                <p className="text-xs text-gray-600">
                  {getUserBatch()}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        userProgress.progressPercentage === 100 ? 'bg-green-500' :
                        'bg-gradient-to-r from-cyan-500 to-teal-400'
                      }`}
                      style={{ width: `${userProgress.progressPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-cyan-700">{userProgress.progressPercentage}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle size={10} className={userProgress.completedCourses > 0 ? 'text-green-500' : 'text-gray-400'} />
                    {userProgress.completedCourses} completed
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={10} className="text-gray-400" />
                    {userProgress.totalCourses} enrolled
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* User Profile Section - END */}

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  end={item.path === "/student/dashboard"}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3.5 rounded-xl 
                    transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-lg' 
                      : 'text-gray-800 hover:bg-cyan-50'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>
                    {item.icon}
                  </span>
                  <span className="font-medium">
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-cyan-100 bg-gradient-to-r from-white to-cyan-50 space-y-3">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-all duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home size={18} />
              <span className="font-medium">Back to Home</span>
            </NavLink>

            <button 
              onClick={() => {
                window.location.href = '/';
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2.5 w-full text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-lg transition-all duration-300"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Adjuster for Desktop Sidebar */}
      <div className={`
        hidden lg:block transition-all duration-500 ease-in-out
        ${isOpen ? 'ml-64' : 'ml-20'}
      `}>
        {/* This ensures content doesn't go under sidebar */}
        <div className="h-16"></div>
      </div>
    </>
  );
};

export default StudentSidebar;