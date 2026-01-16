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
    normalizedCurrency
  )
    ? "₹"
    : rawCurrency;
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  const [showLogin, setShowLogin] = useState(false);
  const [isEducator, setIsEducator] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [userData, setUserData] = useState(null);
  const [enrolledProjects, setEnrolledProjects] = useState([]);
  const roleRedirectedRef = useRef(false);
  const previousUserRef = useRef(null);

  // ✅ Fetch all projects (handles errors gracefully)
  const fetchAllProjects = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/project/all`, {
        timeout: 8000,
      });

      if (response?.data?.success) {
        const projects = response.data.projects || [];
        setAllProjects(projects);
      } else {
        toast.error(response?.data?.message || "Failed to load projects.");
        setAllProjects([]);
      }
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        toast.error(
          "Cannot connect to backend. Check your internet or backend deployment."
        );
      } else if (error.response?.status === 500) {
        toast.error("Server error while fetching projects.");
      } else if (error.message?.includes("CORS")) {
        toast.error("CORS issue: backend not allowing this origin.");
      } else {
        toast.error(error.message || "Unknown error fetching projects.");
      }

      setAllProjects([]); // Safe fallback
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
                  }
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
              "Setting up your account... Please refresh the page if this persists."
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
                }
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
            "Setting up your account... Please refresh the page if this persists."
          );
        }, 1000);
      } else if (error.message?.includes("CORS")) {
        toast.error(
          "CORS error — backend not configured to allow this origin."
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

  // ✅ Fetch enrolled projects
  const fetchUserEnrolledProjects = async () => {
    try {
      if (!user) {
        setEnrolledProjects([]);
        return;
      }

      const token = await getToken();
      if (!token) {
        setEnrolledProjects([]);
        return;
      }

      const response = await axios.get(
        `${backendUrl}/api/user/enrolled-projects`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 8000 }
      );

      if (response?.data?.success) {
        setEnrolledProjects(response.data.enrolledProjects.reverse());
      } else {
        toast.error(
          response?.data?.message || "Failed to load enrolled projects."
        );
      }
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        toast.error("Network error while fetching enrolled projects.");
      } else if (error.response?.status === 500) {
        toast.error("Server error while loading enrolled projects.");
      } else if (error.message?.includes("CORS")) {
        toast.error("CORS issue while loading enrolled projects.");
      } else {
        toast.error(error.message || "Unknown error loading projects.");
      }

      setEnrolledProjects([]);
    }
  };

  // ✅ Fetch single project (includes PDFs)
  const fetchProjectById = async (projectId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/project/${projectId}`, {
        timeout: 8000,
      });
      if (response?.data?.success) return response.data.projectData;
      else {
        toast.error(response?.data?.message || "Failed to load project.");
        return null;
      }
    } catch (error) {
      toast.error(error.message || "Error fetching project.");
      return null;
    }
  };

  // 🧮 Utility functions
  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.forEach(
      (lecture) => (time += lecture.lectureDuration)
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateProjectDuration = (project) => {
    let time = 0;
    project.projectContent.forEach((chapter) =>
      chapter.chapterContent.forEach(
        (lecture) => (time += lecture.lectureDuration)
      )
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateRating = (project) => {
    if (project.projectRatings.length === 0) return 0;
    const total = project.projectRatings.reduce((acc, r) => acc + r.rating, 0);
    return Math.floor(total / project.projectRatings.length);
  };

  const calculateNoOfLectures = (project) => {
    return project.projectContent.reduce((total, chapter) => {
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

    // Show login success message when user logs in (transition from null to user)
    if (!previousUserRef.current && user) {
      toast.success(
        `Welcome back to ${
          user.firstName || user.emailAddresses[0]?.emailAddress || "User"
        } 🎉`
      );
    }

    previousUserRef.current = user;

    const role = user.publicMetadata?.role || "student";
    fetchUserData();
    fetchUserEnrolledProjects();

    if (!roleRedirectedRef.current) {
      if (role === "educator" || role === "admin") navigate("/educator");
      else navigate("/");
      roleRedirectedRef.current = true;
    }
  }, [user, isLoaded]);

  useEffect(() => {
    fetchAllProjects();
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
    allProjects,
    fetchAllProjects,
    enrolledProjects,
    setEnrolledProjects,
    fetchUserEnrolledProjects,
    fetchProjectById,
    calculateChapterTime,
    calculateProjectDuration,
    calculateRating,
    calculateNoOfLectures,
    isEducator,
    setIsEducator,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
