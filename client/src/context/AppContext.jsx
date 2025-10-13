// 📁 src/context/AppContext.jsx
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  const [showLogin, setShowLogin] = useState(false);
  const [isEducator, setIsEducator] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // ✅ Fetch all courses
  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/course/all");
      if (data.success) setAllCourses(data.courses);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Fetch user data + determine role
  const fetchUserData = async () => {
    try {
      if (!user) return;
      const token = await getToken();
      const { data } = await axios.get(backendUrl + "/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserData(data.user);

        // Clerk role check
        const role = user?.publicMetadata?.role || "student";
        if (role === "educator" || role === "admin") {
          setIsEducator(true);
        } else {
          setIsEducator(false);
        }
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Fetch enrolled courses
  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        backendUrl + "/api/user/enrolled-courses",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) setEnrolledCourses(data.enrolledCourses.reverse());
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ⏱ Calculate durations, ratings, etc.
  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration));
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.map((chapter) =>
      chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration))
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateRating = (course) => {
    if (course.courseRatings.length === 0) return 0;
    let total = 0;
    course.courseRatings.forEach((r) => (total += r.rating));
    return Math.floor(total / course.courseRatings.length);
  };

  const calculateNoOfLectures = (course) => {
    let total = 0;
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        total += chapter.chapterContent.length;
      }
    });
    return total;
  };

  // ✅ Redirect users based on their role
  useEffect(() => {
    if (isLoaded && user) {
      const role = user.publicMetadata?.role || "student";
      fetchUserData();
      fetchUserEnrolledCourses();

      if (role === "educator" || role === "admin") {
        navigate("/educator");
      } else {
        navigate("/");
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
    getToken,
    allCourses,
    fetchAllCourses,
    enrolledCourses,
    fetchUserEnrolledCourses,
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
