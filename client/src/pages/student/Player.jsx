import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import YouTube from "react-youtube";
import { assets } from "../../assets/assets";
import { useParams } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import axios from "axios";
import { toast } from "react-toastify";
import Rating from "../../components/student/Rating";
import Footer from "../../components/student/Footer";
import Loading from "../../components/student/Loading";

const Player = () => {
  const {
    enrolledCourses,
    backendUrl,
    getToken,
    calculateChapterTime,
    userData,
    fetchUserEnrolledCourses,
  } = useContext(AppContext);

  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);

  // Extract YouTube video ID
  const getYouTubeVideoId = (url) => {
    try {
      const regExp =
        /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    } catch {
      return null;
    }
  };

  // Load course data
  const getCourseData = () => {
    enrolledCourses.forEach((course) => {
      if (course._id === courseId) {
        setCourseData(course);

        // Auto-select first lecture
        setPlayerData((prev) => {
          if (prev) return prev;
          if (course.courseContent?.[0]?.chapterContent?.[0]) {
            return {
              ...course.courseContent[0].chapterContent[0],
              chapter: 1,
              lecture: 1,
            };
          }
          return null;
        });

        course.courseRatings.forEach((item) => {
          if (item.userId === userData._id) setInitialRating(item.rating);
        });
      }
    });
  };

  useEffect(() => {
    if (enrolledCourses.length > 0) getCourseData();
  }, [enrolledCourses]);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Mark lecture as completed
  const markLectureAsCompleted = async (lectureId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/update-course-progress`,
        { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getCourseProgress();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch course progress
  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/get-course-progress`,
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) setProgressData(data.progressData);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getCourseProgress();
  }, []);

  // Handle rating
  const handleRate = async (rating) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/add-rating`,
        { courseId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        fetchUserEnrolledCourses();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!courseData) return <Loading />;

  // ✅ Get PDFs directly from MongoDB (no Cloudinary)
  const pdfList = courseData.pdfResources || [];

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* -------- Left Side: Course Structure (Sidebar) -------- */}
          <div className="lg:col-span-1 order-2 lg:order-1 flex flex-col gap-6">
            {/* Project Resources */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">📂</span> Project Resources
              </h3>

              {pdfList.length > 0 ? (
                <div className="space-y-3">
                  {pdfList.map((pdf, idx) => (
                    <div
                      key={pdf._id || idx}
                      className="flex flex-col gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">
                            {pdf.pdfTitle || `Resource ${idx + 1}`}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {pdf.pdfDescription ||
                              "Project documentation."}
                          </p>
                        </div>
                      </div>

                      {/* ✅ Show button only if pdfUrl exists */}
                      {pdf.pdfUrl ? (
                        <button
                          onClick={() =>
                            window.open(
                              pdf.pdfUrl,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                          className="w-full flex items-center justify-center gap-2 bg-white border border-blue-200 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                        >
                          <span>Open Project {idx + 1}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-3.5 h-3.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                            />
                          </svg>
                        </button>
                      ) : (
                        <div className="text-center text-xs text-gray-400 italic py-1">
                          Login to access
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No resources available.
                </div>
              )}
            </div>

            {/* -------- Rating -------- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-3">
              <h3 className="font-bold text-gray-800">Rate this Course</h3>
              <Rating initialRating={initialRating} onRate={handleRate} />
            </div>
          </div>

          {/* -------- Right Side: Player (Main) -------- */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="space-y-6">
              {/* Video Player */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="relative w-full aspect-video bg-black">
                  {playerData ? (
                    <YouTube
                      videoId={getYouTubeVideoId(playerData.lectureUrl)}
                      iframeClassName="w-full h-full"
                      opts={{
                        playerVars: {
                          autoplay: 1,
                          modestbranding: 1,
                          rel: 0,
                        },
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <img
                        src={courseData.courseThumbnail}
                        alt="Course Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Video Controls / Info */}
                {playerData && (
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                          {playerData.lectureTitle}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                            Chapter {playerData.chapter}
                          </span>
                          <span>•</span>
                          <span>Lecture {playerData.lecture}</span>
                          <span>•</span>
                          <span>
                            {humanizeDuration(
                              playerData.lectureDuration * 60 * 1000,
                              { units: ["m", "s"] }
                            )}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          markLectureAsCompleted(playerData.lectureId)
                        }
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm ${
                          progressData?.lectureCompleted.includes(
                            playerData.lectureId
                          )
                            ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
                            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                        }`}
                      >
                        {progressData?.lectureCompleted.includes(
                          playerData.lectureId
                        ) ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Completed
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Mark Complete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Player;
