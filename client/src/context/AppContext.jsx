// 📁 src/context/AppContext.jsx
import axios from "axios";
import { createContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [isEducator, setIsEducator] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const roleRedirectedRef = useRef(false);
  const previousUserRef = useRef(null);

  // ✅ Fetch all courses (handles errors gracefully)
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
        toast.error(
          "Cannot connect to backend. Check your internet or backend deployment.",
        );
      } else if (error.response?.status === 500) {
        toast.error("Server error while fetching courses.");
      } else if (error.message?.includes("CORS")) {
        toast.error("CORS issue: backend not allowing this origin.");
      } else {
        toast.error(error.message || "Unknown error fetching courses.");
      }

      setAllCourses([]); // Safe fallback
    }
  };

  // ✅ Fetch user data (robust to CORS/network errors)
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
        // For first-time users, retry once after a short delay
        const errorMessage =
          response?.data?.message || "Failed to load user data.";
        if (
          errorMessage.includes("User Not Found") ||
          errorMessage.includes("Unable to create user")
        ) {
          // Retry after 1 second for first-time login
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
                  return; // Success, don't show error
                }
              }
            } catch (retryError) {
              // If retry also fails, show error
              console.error("Retry failed:", retryError);
            }
            toast.error(
              "Setting up your account... Please refresh the page if this persists.",
            );
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
        // User not found - retry once
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
          toast.error(
            "Setting up your account... Please refresh the page if this persists.",
          );
        }, 1000);
      } else if (error.message?.includes("CORS")) {
        toast.error(
          "CORS error — backend not configured to allow this origin.",
        );
      } else {
        toast.error(error.message || "Unknown error fetching user data.");
      }

      // Don't set userData to null immediately - wait for retry
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
        toast.error(
          response?.data?.message || "Failed to load enrolled courses.",
        );
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

  // ✅ Fetch single course (includes PDFs)
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

  // ✅ Role-based redirect + data fetch + login success message
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      roleRedirectedRef.current = false;
      previousUserRef.current = null;
      return;
    }

    // ✅ Show welcome toast only once per session
    const hasShownWelcome = sessionStorage.getItem("welcome_shown");
    if (!hasShownWelcome) {
      toast.success(
        `Welcome ${
          user.firstName || user.emailAddresses[0]?.emailAddress || "User"
        } 🎉`,
      );
      sessionStorage.setItem("welcome_shown", "true");
    }

    previousUserRef.current = user;

    const role = user.publicMetadata?.role || "student";
    fetchUserData();
    fetchUserEnrolledCourses();

    if (!roleRedirectedRef.current) {
      if (role === "educator" || role === "admin") navigate("/educator");
      else navigate("/");
      roleRedirectedRef.current = true;
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
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
