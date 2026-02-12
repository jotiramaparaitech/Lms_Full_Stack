// 📁 src/context/AppContext.jsx
import axios from "axios";
import { createContext, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext();

// ✅ Global axios defaults
axios.defaults.withCredentials = true;

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const rawCurrency = (import.meta.env.VITE_CURRENCY || "₹").toString();
  const normalizedCurrency = rawCurrency.trim().toLowerCase();
  const currency = ["$", "usd", "rs", "rs.", "inr", "rupees"].includes(
    normalizedCurrency,
  )
    ? "₹"
    : rawCurrency;
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  const [showLogin, setShowLogin] = useState(false);
  const [isEducator, setIsEducator] = useState(undefined);
  const location = useLocation();

  const [allCourses, setAllCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const roleRedirectedRef = useRef(false);
  const previousUserRef = useRef(null);

  const [isTeamLeader, setIsTeamLeader] = useState(false);

  // ✅ Individual student progress states
  const [studentTeams, setStudentTeams] = useState([]);
  const [studentOverallProgress, setStudentOverallProgress] = useState(0); // 🔥 FIXED: Will store MAX progress
  const [studentProjectName, setStudentProjectName] = useState("");
  const [lorUnlocked, setLorUnlocked] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);

  // ✅ FIXED: Fetch individual student progress - USE MAX PROGRESS FROM BACKEND
  const fetchMyTeamProgress = async () => {
    try {
      if (!user) {
        setStudentTeams([]);
        setStudentOverallProgress(0);
        setStudentProjectName("");
        setLorUnlocked(false);
        return;
      }

      setTeamsLoading(true);
      const token = await getToken();
      if (!token) return;

      const res = await axios.get(`${backendUrl}/api/teams/my-progress`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000,
      });

      if (res?.data?.success) {
        // ✅ Store ALL teams with their INDIVIDUAL progress
        setStudentTeams(res.data.teams || []);
        
        // 🔥 FIXED: Use the overallProgress from backend (which is MAX progress)
        // Backend already calculates maxProgress, so use that value
        setStudentOverallProgress(Number(res.data.overallProgress || 0));
        
        // Get first team's project name and LOR status for backward compatibility
        if (res.data.teams && res.data.teams.length > 0) {
          setStudentProjectName(res.data.teams[0].projectName || "");
          setLorUnlocked(res.data.teams.some(t => t.lorUnlocked));
        }
      }
    } catch (error) {
      console.error("Error fetching team progress:", error);
      setStudentTeams([]);
      setStudentOverallProgress(0);
      setStudentProjectName("");
      setLorUnlocked(false);
    } finally {
      setTeamsLoading(false);
    }
  };

  const fetchTeamLeaderStatus = async () => {
    try {
      if (!user) {
        setIsTeamLeader(false);
        return;
      }

      const token = await getToken();
      if (!token) {
        setIsTeamLeader(false);
        return;
      }

      const profileSaysLeader = Boolean(userData?.isTeamLeader);
      setIsTeamLeader(profileSaysLeader);
      
    } catch (error) {
      if (!userData?.isTeamLeader) {
        setIsTeamLeader(false);
      }
    }
  };

  // ✅ Sync isTeamLeader with userData when it loads
  useEffect(() => {
    if (userData?.isTeamLeader) {
      setIsTeamLeader(true);
    }
  }, [userData]);

  // ✅ Fetch all courses
  const fetchAllCourses = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/course/all`, {
        timeout: 8000,
      });

      if (response?.data?.success) {
        const courses = response.data.courses || [];
        setAllCourses(courses);
      } else {
        toast.error(response?.data?.message || "Failed to load courses.");
        setAllCourses([]);
      }
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        toast.error("Cannot connect to backend. Check your internet or backend deployment.");
      } else if (error.response?.status === 500) {
        toast.error("Server error while fetching courses.");
      } else if (error.message?.includes("CORS")) {
        toast.error("CORS issue: backend not allowing this origin.");
      } else {
        toast.error(error.message || "Unknown error fetching courses.");
      }
      setAllCourses([]);
    }
  };

  // ✅ Fetch user data
  const fetchUserData = async () => {
    try {
      if (!user) {
        setUserData(null);
        return;
      }

      const token = await getToken();
      if (!token) {
        return;
      }

      const response = await axios.get(`${backendUrl}/api/user/data`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000,
      });

      if (response?.data?.success) {
        setUserData(response.data.user);
        const role = user?.publicMetadata?.role || "student";
        setIsEducator(role === "educator" || role === "admin");
      } else {
        const errorMessage = response?.data?.message || "Failed to load user data.";
        if (
          errorMessage.includes("User Not Found") ||
          errorMessage.includes("Unable to create user")
        ) {
          setTimeout(async () => {
            try {
              const retryToken = await getToken();
              if (retryToken) {
                const retryResponse = await axios.get(
                  `${backendUrl}/api/user/data`,
                  {
                    headers: { Authorization: `Bearer ${retryToken}` },
                    timeout: 8000,
                  },
                );
                if (retryResponse?.data?.success) {
                  setUserData(retryResponse.data.user);
                  const role = user?.publicMetadata?.role || "student";
                  setIsEducator(role === "educator" || role === "admin");
                  return;
                }
              }
            } catch (retryError) {
              console.error("Retry failed:", retryError);
            }
            toast.error("Setting up your account... Please refresh the page if this persists.");
          }, 1000);
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        toast.error("Cannot reach backend. Check your network or CORS setup.");
      } else if (error.response?.status === 401) {
        toast.error("Unauthorized. Please log in again.");
      } else if (error.response?.status === 404) {
        setTimeout(async () => {
          try {
            const retryToken = await getToken();
            if (retryToken) {
              const retryResponse = await axios.get(
                `${backendUrl}/api/user/data`,
                {
                  headers: { Authorization: `Bearer ${retryToken}` },
                  timeout: 8000,
                },
              );
              if (retryResponse?.data?.success) {
                setUserData(retryResponse.data.user);
                const role = user?.publicMetadata?.role || "student";
                setIsEducator(role === "educator" || role === "admin");
                return;
              }
            }
          } catch (retryError) {
            console.error("Retry failed:", retryError);
          }
          toast.error("Setting up your account... Please refresh the page if this persists.");
        }, 1000);
      } else if (error.message?.includes("CORS")) {
        toast.error("CORS error — backend not configured to allow this origin.");
      } else {
        toast.error(error.message || "Unknown error fetching user data.");
      }

      if (error.response?.status !== 404) {
        setUserData(null);
      }
    }
  };

  // ✅ Fetch enrolled courses
  const fetchUserEnrolledCourses = async () => {
    try {
      if (!user) {
        setEnrolledCourses([]);
        return;
      }

      const token = await getToken();
      if (!token) {
        setEnrolledCourses([]);
        return;
      }

      const response = await axios.get(
        `${backendUrl}/api/user/enrolled-courses`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 8000 },
      );

      if (response?.data?.success) {
        setEnrolledCourses(response.data.enrolledCourses.reverse());
      } else {
        toast.error(response?.data?.message || "Failed to load enrolled courses.");
      }
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        toast.error("Network error while fetching enrolled courses.");
      } else if (error.response?.status === 500) {
        toast.error("Server error while loading enrolled courses.");
      } else if (error.message?.includes("CORS")) {
        toast.error("CORS issue while loading enrolled courses.");
      } else {
        toast.error(error.message || "Unknown error loading courses.");
      }
      setEnrolledCourses([]);
    }
  };

  // ✅ Fetch single course
  const fetchCourseById = async (courseId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/course/${courseId}`, {
        timeout: 8000,
      });
      if (response?.data?.success) return response.data.courseData;
      else {
        toast.error(response?.data?.message || "Failed to load course.");
        return null;
      }
    } catch (error) {
      toast.error(error.message || "Error fetching course.");
      return null;
    }
  };

  // 🧮 Utility functions
  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.forEach(
      (lecture) => (time += lecture.lectureDuration),
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.forEach((chapter) =>
      chapter.chapterContent.forEach(
        (lecture) => (time += lecture.lectureDuration),
      ),
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateRating = (course) => {
    if (course.courseRatings.length === 0) return 0;
    const total = course.courseRatings.reduce((acc, r) => acc + r.rating, 0);
    return Math.floor(total / course.courseRatings.length);
  };

  const calculateNoOfLectures = (course) => {
    return course.courseContent.reduce((total, chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        total += chapter.chapterContent.length;
      }
      return total;
    }, 0);
  };

  // ✅ Role-based redirect
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      roleRedirectedRef.current = false;
      previousUserRef.current = null;
      return;
    }

    const hasShownWelcome = sessionStorage.getItem("welcome_shown");
    if (!hasShownWelcome) {
      toast.success(
        `Welcome ${user.firstName || user.emailAddresses[0]?.emailAddress || "User"} 🎉`,
      );
      sessionStorage.setItem("welcome_shown", "true");
    }

    previousUserRef.current = user;

    const role = user.publicMetadata?.role || "student";
    fetchUserData();
    fetchUserEnrolledCourses();
    fetchTeamLeaderStatus();
    fetchMyTeamProgress();

    if (
      !roleRedirectedRef.current &&
      location.pathname === "/login"
    ) {
      if (role === "educator" || role === "admin") {
        roleRedirectedRef.current = true;
        navigate("/educator", { replace: true });
      }
    }

  }, [user, isLoaded]);

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const value = {
    showLogin,
    setShowLogin,
    backendUrl,
    currency,
    navigate,
    userData,
    setUserData,
    fetchUserData,
    getToken,
    allCourses,
    fetchAllCourses,
    enrolledCourses,
    setEnrolledCourses,
    fetchUserEnrolledCourses,
    fetchCourseById,
    calculateChapterTime,
    calculateCourseDuration,
    calculateRating,
    calculateNoOfLectures,
    isEducator,
    setIsEducator,
    isTeamLeader,
    fetchTeamLeaderStatus,
    
    // ✅ FIXED: Student's own progress values
    studentTeams,
    studentOverallProgress, // 🔥 This now contains the MAX progress from backend
    studentProjectName,
    lorUnlocked,
    teamsLoading,
  
    // ✅ Keep teamProgress as alias for backward compatibility
    teamProgress: studentOverallProgress, // 🔥 FIXED: Now shows 80% not 0%
    teamProjectName: studentProjectName,
    
    fetchMyTeamProgress,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};