import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import StudentSidebar from "../../components/student/StudentSidebar";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  Eye,
  FolderKanban,
  ClipboardList,
  PlayCircle,
  ChevronRight,
  BookMarked,
  Target,
  FolderOpen,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { AppContext } from "../../context/AppContext";
import { motion } from "framer-motion";

// Placeholder pages for other sections
const MyProjectsPage = () => {
  const { navigate } = useContext(AppContext);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Projects</h1>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            View Your Projects
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            All your assign projects are available in the My Projects section.
          </p>
          <button
            onClick={() => navigate("/student/projects")}
            className="bg-gradient-to-r from-cyan-600 to-teal-500 text-white py-3 px-8 rounded-lg font-medium hover:from-cyan-700 hover:to-teal-600 transition-all duration-300 inline-flex items-center justify-center gap-2"
          >
            <BookOpen size={20} />
            Go to My Projects
          </button>
        </div>
      </div>
    </div>
  );
};

const TestsPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-800 mb-6">
      Tests & Assessments
    </h1>
    <div className="bg-white rounded-xl shadow-lg p-6">
      <p className="text-gray-600">
        Your tests and assessments will appear here.
      </p>
    </div>
  </div>
);

const CertificatesPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-800 mb-6">Certificates</h1>
    <div className="bg-white rounded-xl shadow-lg p-6">
      <p className="text-gray-600">
        Your earned certificates will appear here.
      </p>
    </div>
  </div>
);

const ProgressPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-800 mb-6">
      Progress Tracker
    </h1>
    <div className="bg-white rounded-xl shadow-lg p-6">
      <p className="text-gray-600">
        Your detailed progress analytics will appear here.
      </p>
    </div>
  </div>
);

// Main Dashboard Home Component
const DashboardHome = () => {
  const {
    userData,
    enrolledCourses,
    fetchUserEnrolledCourses,
    navigate,
    calculateCourseDuration,
    calculateNoOfLectures,

    // ✅ Use student's OWN progress, not team average
    studentOverallProgress,
    fetchMyTeamProgress,
  } = useContext(AppContext);

  const [progressArray, setProgressData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    activeProjects: 0,
    completedTasks: 0,
    studyHours: 0,
    certificates: 0,
    pendingTasks: 0,
  });

  // ✅ Refresh student's own progress when dashboard loads
  useEffect(() => {
    fetchMyTeamProgress();
  }, []);

  // ✅ Calculate Study Hours
  const calculateStudyHours = () => {
    return 0;
  };

  // Update dashboard statistics
  const updateStats = (progressArray, courses) => {
    if (!courses || courses.length === 0) {
      setStats({
        activeProjects: 0,
        completedTasks: 0,
        studyHours: 0,
        certificates: 0,
        pendingTasks: 0,
      });
      return;
    }

    // ✅ Remove duplicate courses based on _id
    const uniqueCourses = [];
    const courseIds = new Set();
    
    courses.forEach(course => {
      if (!courseIds.has(course._id)) {
        courseIds.add(course._id);
        uniqueCourses.push(course);
      }
    });

    const activeProjects = progressArray.filter(
      (p) => p.progressPercent > 0 && p.progressPercent < 100
    ).length;

    const completedTasks = progressArray.reduce(
      (sum, p) => sum + p.lectureCompleted,
      0
    );

    const pendingTasks = progressArray.reduce(
      (sum, p) => sum + (p.totalLectures - p.lectureCompleted),
      0
    );

    const studyHours = calculateStudyHours();

    const certificates = progressArray.filter((p) => p.progressPercent === 100)
      .length;

    setStats({
      activeProjects: uniqueCourses.length, // ✅ Use unique courses count
      completedTasks,
      studyHours,
      certificates,
      pendingTasks,
    });
  };

  // Fetch course progress
  const getCourseProgress = async () => {
    try {
      // ✅ Remove duplicate courses before processing
      const uniqueCourses = [];
      const courseIds = new Set();
      
      enrolledCourses.forEach(course => {
        if (!courseIds.has(course._id)) {
          courseIds.add(course._id);
          uniqueCourses.push(course);
        }
      });

      const tempProgressArray = uniqueCourses.map((course) => {
        const totalLectures = calculateNoOfLectures(course);
        return {
          courseId: course._id,
          totalLectures,
          lectureCompleted: 0,
          progressPercent: 0,
        };
      });

      setProgressData(tempProgressArray);
      updateStats(tempProgressArray, uniqueCourses); // ✅ Pass unique courses
    } catch (error) {
      console.error("Error fetching course progress:", error);
    }
  };

  // Mock recent activities
  const fetchRecentActivities = async () => {
    // ✅ Use unique course for activity
    const uniqueCourses = [];
    const courseIds = new Set();
    
    enrolledCourses.forEach(course => {
      if (!courseIds.has(course._id)) {
        courseIds.add(course._id);
        uniqueCourses.push(course);
      }
    });

    const mockActivities = [
      {
        id: 1,
        activity: "Assigned in new project",
        time: "",
        type: "enrollment",
        courseName: uniqueCourses[0]?.courseTitle || "New Course",
      },
      {
        id: 3,
        activity: "Submitted project",
        time: "",
        type: "submission",
        projectName: "E-Commerce Website",
      },
      {
        id: 4,
        activity: "Received certificate",
        time: "",
        type: "certificate",
        certificateName: "Web Development Fundamentals",
      },
      {
        id: 5,
        activity: "Attended live session",
        time: "",
        type: "session",
        sessionTopic: "API Integration",
      },
    ];
    setRecentActivities(mockActivities);
  };

  // Mock upcoming deadlines
  const upcomingDeadlines = [
    {
      id: 1,
      task: "Complete Project Submission",
      date: "",
      priority: "high",
      courseId: enrolledCourses[0]?._id,
    },
    {
      id: 2,
      task: "Mid-Term Assessment",
      date: "",
      priority: "medium",
      courseId: enrolledCourses[0]?._id,
    },
    {
      id: 3,
      task: "Final Project Review",
      date: "",
      priority: "low",
      courseId: enrolledCourses[0]?._id,
    },
  ];

  // ✅ STATS CARDS - EXACTLY as you had them, no My Progress card, no My Teams card
  const statsCards = [
    {
      title: "Assigned Projects",
      value: enrolledCourses.length, // This will still show duplicate count - fix below
      icon: <BookOpen size={24} />,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
      change:
        enrolledCourses.length > 0
          ? stats.activeProjects > 0
            ? `${stats.activeProjects} in progress`
            : "Not started yet"
          : "No projects yet",
    },
    {
      title: "Pending Project Work",
      value: stats.pendingTasks,
      icon: <AlertCircle size={24} />,
      color: "bg-gradient-to-r from-yellow-500 to-amber-500",
      change: stats.pendingTasks > 0 ? "Continue learning" : "All caught up!",
    },
    {
      title: "Completed Projects",
      value: stats.completedTasks,
      icon: <CheckCircle size={24} />,
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
      change:
        stats.completedTasks > 0
          ? `${Math.round(
              (stats.completedTasks /
                (stats.completedTasks + stats.pendingTasks)) *
                100
            ) || 0}% completion rate`
          : "Start learning!",
    },
    {
      title: "Documents & Certificates",
      value: stats.certificates,
      icon: <Award size={24} />,
      color: "bg-gradient-to-r from-orange-500 to-red-500",
      change:
        stats.certificates > 0 ? "Great progress!" : "Complete projects to earn",
    },
  ];

  // Calculate dynamic grid classes
  const getGridClass = () => {
    const visibleCards = statsCards.length;
    if (visibleCards <= 1) return "grid-cols-1";
    else if (visibleCards === 2) return "grid-cols-1 md:grid-cols-2";
    else if (visibleCards === 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    else if (visibleCards === 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    else if (visibleCards === 5) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
    else return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "enrollment":
        return <BookMarked size={16} />;
      case "lecture":
        return <PlayCircle size={16} />;
      case "submission":
        return <FileText size={16} />;
      case "certificate":
        return <Award size={16} />;
      case "session":
        return <Users size={16} />;
      default:
        return <CheckCircle size={16} />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "enrollment":
        return "bg-green-100 text-green-600";
      case "lecture":
        return "bg-blue-100 text-blue-600";
      case "submission":
        return "bg-purple-100 text-purple-600";
      case "certificate":
        return "bg-yellow-100 text-yellow-600";
      case "session":
        return "bg-cyan-100 text-cyan-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  useEffect(() => {
    if (userData) {
      fetchUserEnrolledCourses();
    }
  }, [userData]);

  useEffect(() => {
    if (enrolledCourses.length >= 0) {
      getCourseProgress();
      fetchRecentActivities();
      setLoading(false);
    }
  }, [enrolledCourses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // ✅ Remove duplicate courses for display in My Projects section
  const uniqueEnrolledCourses = [];
  const courseIds = new Set();
  
  enrolledCourses.forEach(course => {
    if (!courseIds.has(course._id)) {
      courseIds.add(course._id);
      uniqueEnrolledCourses.push(course);
    }
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner - SHOW STUDENT'S OWN PROGRESS */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2"
            >
              Welcome back, {userData?.name || "Student"}!
              <Sparkles className="inline" size={24} />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-cyan-100 mb-4"
            >
              {uniqueEnrolledCourses.length > 0 ? ( // ✅ Use unique courses count
                <>
                  You're assigned to{" "}
                  <span className="font-bold">
                    {uniqueEnrolledCourses.length} project
                    {uniqueEnrolledCourses.length !== 1 ? "s" : ""}
                  </span>
                  . Your personal progress is{" "}
                  <span className="font-bold">{studentOverallProgress || 0}%</span>.
                </>
              ) : (
                "Get started by enrolling in your first project!"
              )}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 text-sm"
            >
              {userData?.email && (
                <span className="flex items-center gap-1">
                  📧 {userData.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={14} />{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 md:mt-0"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">My Progress</span> {/* ✅ Changed from Overall Progress */}
                <span className="text-lg font-bold">{studentOverallProgress || 0}%</span>
              </div>
              <div className="w-64 bg-white/30 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${studentOverallProgress || 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-white to-cyan-200 h-3 rounded-full"
                ></motion.div>
              </div>
              <p className="text-xs text-cyan-100 mt-2">
                {uniqueEnrolledCourses.length} project {/* ✅ Use unique courses count */}
                {uniqueEnrolledCourses.length !== 1 ? "s" : ""} enrolled •{" "}
                {stats.certificates} certificate
                {stats.certificates !== 1 ? "s" : ""} earned
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid - EXACTLY as you had it */}
      <div className={`grid ${getGridClass()} gap-4`}>
        {statsCards.map((stat, index) => {
          // ✅ Fix Assigned Projects count to show unique courses
          if (index === 0) {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-xl text-white shadow-md`}>
                    {stat.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    {stat.change}
                  </span>
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2 text-gray-800">
                    {uniqueEnrolledCourses.length} {/* ✅ Show unique courses count */}
                  </p>
                </div>
              </motion.div>
            );
          }
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-xl text-white shadow-md`}>
                  {stat.icon}
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {stat.change}
                </span>
              </div>
              <div className="flex-grow">
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-2 text-gray-800">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Projects Progress - SHOW STUDENT'S OWN PROGRESS */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FolderKanban size={24} className="text-cyan-600" />
              My Projects
            </h2>
            <button
              onClick={() => navigate("/student/projects")}
              className="text-cyan-600 hover:text-cyan-800 font-medium text-sm flex items-center gap-1"
            >
              <Eye size={16} /> View All
            </button>
          </div>

          {uniqueEnrolledCourses.length === 0 ? ( // ✅ Use unique courses
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Projects Enrolled Yet
              </h3>
              <p className="text-gray-500 mb-4">
                Enroll in projects to start your learning journey
              </p>
              <button
                onClick={() => navigate("/courses")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-teal-600 transition-all"
              >
                Browse Projects <ChevronRight size={16} />
              </button>
            </motion.div>
          ) : (
            <div className="space-y-5">
              {uniqueEnrolledCourses.slice(0, 3).map((course, index) => ( // ✅ Use unique courses
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="border-l-4 border-cyan-500 pl-4 py-3 hover:bg-gray-50 rounded-r-lg transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate group-hover:text-cyan-700">
                        {course.courseTitle}
                      </h3>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ml-2 flex-shrink-0 ${
                        (studentOverallProgress || 0) === 100
                          ? "bg-green-100 text-green-800"
                          : (studentOverallProgress || 0) > 0
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {(studentOverallProgress || 0) === 100
                        ? "Completed"
                        : (studentOverallProgress || 0) > 0
                          ? "In Progress"
                          : "Not Started"}
                    </span>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>My Progress</span> {/* ✅ Changed from Overall Progress */}
                      <span className="font-semibold">{studentOverallProgress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${studentOverallProgress || 0}%` }}
                        transition={{ duration: 1 }}
                        className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full"
                      ></motion.div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate("/player/" + course._id)}
                        className="text-cyan-600 hover:text-cyan-800 flex items-center gap-1 font-medium"
                      >
                        <PlayCircle size={14} /> Continue
                      </button>
                      <button
                        onClick={() => navigate(`/course-details/${course._id}`)}
                        className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - EXACTLY as you had it, no My Teams section */}
        <div className="space-y-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ClipboardList size={24} className="text-cyan-600" />
                Recent Activities
              </h2>
              <button className="text-cyan-600 hover:text-cyan-800 font-medium text-sm">
                See All
              </button>
            </div>

            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activities</p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <div
                      className={`p-2 rounded-lg ${getActivityColor(
                        activity.type
                      )} group-hover:scale-110 transition-transform`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate group-hover:text-cyan-700">
                        {activity.activity}
                        {activity.courseName && (
                          <span className="text-gray-600">
                            : {activity.courseName}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar size={24} className="text-cyan-600" />
                Upcoming Deadlines
              </h2>
              <button className="text-cyan-600 hover:text-cyan-800 font-medium text-sm flex items-center gap-1">
                <Calendar size={16} /> Calendar
              </button>
            </div>

            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <motion.div
                  key={deadline.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 group-hover:text-cyan-700">
                        {deadline.task}
                      </h4>
                      <p className="text-sm text-gray-600">{deadline.date}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${getPriorityColor(
                      deadline.priority
                    )}`}
                  >
                    {deadline.priority.toUpperCase()}
                  </span>
                </motion.div>
              ))}

              {/* Learning Reminder */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg border border-cyan-100 group hover:from-cyan-100 hover:to-teal-100 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
                    <Target size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Daily Learning Goal
                    </h4>
                    <p className="text-sm text-gray-600">
                      Stay consistent with your project
                    </p>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-cyan-100 text-cyan-800">
                  DAILY
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary - SHOW STUDENT'S OWN PROGRESS */}
      {uniqueEnrolledCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Learning Summary</h3>
              <p className="text-cyan-100">
                {studentOverallProgress >= 80 && " Keep up the excellent work! 💪"}
                {studentOverallProgress >= 50 &&
                  studentOverallProgress < 80 &&
                  " Great progress so far! ✨"}
                {studentOverallProgress < 50 && " Every step counts, keep going! 🚀"}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{uniqueEnrolledCourses.length}</div>
                  <div className="text-sm text-cyan-200">Active Projects</div>
                </div>
                <div className="h-12 w-px bg-cyan-400"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{studentOverallProgress}%</div>
                  <div className="text-sm text-cyan-200">My Progress</div>
                </div>
                <div className="h-12 w-px bg-cyan-400"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.certificates}</div>
                  <div className="text-sm text-cyan-200">Certificates</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Main StudentDashboard Component
const StudentDashboard = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <main className="p-4 md:p-6 pt-20 lg:pt-6">
          <div className="max-w-7xl mx-auto">
            <Routes location={location} key={location.pathname}>
              <Route index element={<DashboardHome />} />
              <Route path="projects" element={<MyProjectsPage />} />
              <Route path="tests" element={<TestsPage />} />
              <Route path="certificates" element={<CertificatesPage />} />
              <Route path="progress" element={<ProgressPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;