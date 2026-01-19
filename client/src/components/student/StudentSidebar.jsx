import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
  CheckCircle,
  CalendarDays,
  MessageSquare,
  Users,
  CheckSquare
} from "lucide-react";
import { AppContext } from "../../context/AppContext";

const StudentSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
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

  const appItems = [
    {
      icon: <CalendarDays size={20} />,
      label: "Calendar",
      path: "/student/apps/calendar"
    },
    {
      icon: <Users size={20} />,
      label: "Teams",
      path: "/student/apps/teams"
    },
    // {
    //   icon: <MessageSquare size={20} />,
    //   label: "Chat",
    //   path: "/student/apps/chat"
    // },
    {
      icon: <CheckSquare size={20} />,
      label: "Todo",
      path: "/student/apps/todo"
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
  
  const getUserDomain = () => {
    if (userEmail) {
      const domain = userEmail.split('@')[1];
      if (domain) {
        const orgName = domain.split('.')[0];
        return orgName.charAt(0).toUpperCase() + orgName.slice(1) + ' Batch';
      }
    }
    return "Web Development Batch";
  };

  const getUserBatch = () => {
    return userData?.batch || getUserDomain();
  };

  // Handle menu item click
  const handleMenuItemClick = () => {
    setMobileMenuOpen(false);
  };

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

  // DeepSeek-style hamburger menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {/* DeepSeek-style Hamburger Button - MOBILE ONLY */}
      <div className="lg:hidden">
        <button
          onClick={toggleMobileMenu}
          className={`
            fixed z-50 
            bg-gradient-to-r from-cyan-600 to-teal-500 
            text-white shadow-xl hover:shadow-2xl 
            transition-all duration-300 hover:scale-110 active:scale-95
            top-18 left-1
            ${mobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          `}
          style={{
            width: '35px',
            height: '35px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Toggle menu"
        >
          {/* DeepSeek-style hamburger icon with animation */}
          <div className="relative w-5 h-5">
            <span className={`
              absolute top-0 left-0 w-5 h-0.5 bg-white rounded-full 
              transition-all duration-300
              ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}
            `} />
            <span className={`
              absolute top-2 left-0 w-5 h-0.5 bg-white rounded-full 
              transition-all duration-300
              ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}
            `} />
            <span className={`
              absolute bottom-0 left-0 w-5 h-0.5 bg-white rounded-full 
              transition-all duration-300
              ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}
            `} />
          </div>
        </button>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className={`
        hidden lg:flex fixed top-0 left-0 h-screen z-20
        bg-gradient-to-b from-white to-gray-50
        border-r border-gray-200
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-20'}
      `}>
        <div className="flex flex-col h-full w-full">
          {/* Logo/Header Area */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold">
                  S
                </div>
                {isOpen && (
                  <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent">
                    Student Portal
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <ChevronLeft className={`transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`} size={20} />
              </button>
            </div>
          </div>

          {/* User Profile */}
          {isOpen ? (
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold">
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
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    userProgress.progressPercentage === 100 ? 'bg-green-500' : 
                    userProgress.progressPercentage > 0 ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {userDisplayName}
                  </h3>
                  <p className="text-xs text-gray-600 truncate">
                    {getUserBatch()}
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-cyan-600">{userProgress.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          userProgress.progressPercentage === 100 ? 'bg-green-500' :
                          'bg-gradient-to-r from-cyan-500 to-teal-400'
                        }`}
                        style={{ width: `${userProgress.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-gray-200 flex justify-center">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold">
                  <User size={18} />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  userProgress.progressPercentage === 100 ? 'bg-green-500' : 
                  userProgress.progressPercentage > 0 ? 'bg-yellow-500' : 'bg-gray-400'
                }`}></div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 overflow-y-auto">
            {/* Dashboard Item */}
            <div className="mb-4">
              <NavLink
                to="/student/dashboard"
                end
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg 
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border border-cyan-100' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                onClick={handleMenuItemClick}
              >
                {({ isActive }) => (
                  <>
                    <LayoutDashboard size={20} className={isActive ? 'text-cyan-600' : 'text-gray-500'} />
                    {isOpen && <span className="font-medium">Dashboard</span>}
                  </>
                )}
              </NavLink>
            </div>

            {/* Apps Section (Non-Dropdown) */}
            <div className="mb-4">
              {isOpen ? (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Apps
                  </div>
                  <div className="space-y-1">
                    {appItems.map((item, index) => (
                      <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) => `
                          flex items-center gap-3 px-3 py-2 rounded-lg 
                          transition-all duration-200
                          ${isActive 
                            ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                        onClick={handleMenuItemClick}
                      >
                        {({ isActive }) => (
                          <>
                            <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
                              {item.icon}
                            </span>
                            <span className="text-sm font-medium">{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  {appItems.map((item, index) => (
                    <NavLink
                      key={index}
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center justify-center p-2 rounded-lg 
                        transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                      onClick={handleMenuItemClick}
                      title={item.label}
                    >
                      {item.icon}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Main Menu Items */}
            <div className="space-y-1">
              {isOpen && (
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Menu
                </div>
              )}
              {menuItems.slice(1).map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg 
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border border-cyan-100' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  onClick={handleMenuItemClick}
                >
                  {({ isActive }) => (
                    <>
                      <span className={isActive ? 'text-cyan-600' : 'text-gray-500'}>
                        {item.icon}
                      </span>
                      {isOpen && <span className="font-medium">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <NavLink
              to="/"
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg 
                transition-all duration-200
                ${isActive 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              onClick={handleMenuItemClick}
            >
              <Home size={18} />
              {isOpen && <span className="text-sm font-medium">Back to Home</span>}
            </NavLink>

            <button 
              onClick={() => {
                window.location.href = '/';
                handleMenuItemClick();
              }}
              className="flex items-center gap-3 px-3 py-2 w-full text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200"
            >
              <LogOut size={18} />
              {isOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Menu */}
      <div className="lg:hidden">
        <aside className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] z-50
          bg-white
          shadow-2xl
          transition-transform duration-300 ease-in-out
          w-72
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
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* User Profile Details */}
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

            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              {/* Dashboard */}
              <div className="mb-4">
                <NavLink
                  to="/student/dashboard"
                  end
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg 
                    transition-all duration-200 mb-2
                    ${isActive 
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-lg' 
                      : 'text-gray-800 hover:bg-cyan-50'
                    }
                  `}
                  onClick={handleMenuItemClick}
                >
                  <LayoutDashboard size={20} />
                  <span className="font-medium">Dashboard</span>
                </NavLink>
              </div>

              {/* Apps Section (Mobile - Non-Dropdown) */}
              <div className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Apps
                </div>
                <div className="space-y-1">
                  {appItems.map((item, index) => (
                    <NavLink
                      key={index}
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-lg 
                        transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                        }
                      `}
                      onClick={handleMenuItemClick}
                    >
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* Main Menu Items */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Menu
                </div>
                {menuItems.slice(1).map((item, index) => (
                  <NavLink
                    key={index}
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg 
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-lg' 
                        : 'text-gray-800 hover:bg-cyan-50'
                      }
                    `}
                    onClick={handleMenuItemClick}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              <NavLink
                to="/"
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-all duration-200"
                onClick={handleMenuItemClick}
              >
                <Home size={18} />
                <span className="text-sm font-medium">Back to Home</span>
              </NavLink>

              <button 
                onClick={() => {
                  window.location.href = '/';
                  handleMenuItemClick();
                }}
                className="flex items-center gap-3 px-3 py-2 w-full text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-lg transition-all duration-300"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Content Adjuster */}
      <div className={`
        hidden lg:block transition-all duration-300 ease-in-out
        ${isOpen ? 'ml-64' : 'ml-20'}
      `}>
        <div className="h-16"></div>
      </div>
    </>
  );
};

export default StudentSidebar;