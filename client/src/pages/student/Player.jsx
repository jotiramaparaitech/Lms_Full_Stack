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
      <div className="min-h-screen bg-gradient-to-tr from-[#f0f9ff] via-[#e6f7f1] to-[#e3f2fd] p-4 md:p-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16">
          {/* -------- Left Side: Course Structure -------- */}
          <div className="text-gray-800">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Course Structure
            </h2>

            <div className="space-y-4">
              {courseData.courseContent.map((chapter, index) => (
                <div
                  key={chapter.chapterId || index}
                  className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
                >
                  <div
                    className="flex justify-between items-center px-4 py-3 cursor-pointer select-none hover:bg-gray-100 transition"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <img
                        src={assets.down_arrow_icon}
                        alt="arrow"
                        className={`w-4 h-4 transform transition-transform ${
                          openSections[index] ? "rotate-180" : ""
                        }`}
                      />
                      <span>{chapter.chapterTitle}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {chapter.chapterContent.length} lectures -{" "}
                      {calculateChapterTime(chapter)}
                    </span>
                  </div>

                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      openSections[index] ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <ul className="list-none p-4 space-y-2 text-gray-700">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li
                          key={lecture.lectureId || i}
                          className="flex justify-between items-center bg-gray-50 rounded-md p-2 hover:bg-gray-100 transition"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                progressData?.lectureCompleted.includes(
                                  lecture.lectureId
                                )
                                  ? assets.blue_tick_icon
                                  : assets.play_icon
                              }
                              alt="status"
                              className="w-4 h-4 mt-1"
                            />
                            <span>{lecture.lectureTitle}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs md:text-sm">
                            {lecture.lectureUrl && (
                              <button
                                className="text-blue-500 hover:underline"
                                onClick={() =>
                                  setPlayerData({
                                    ...lecture,
                                    chapter: index + 1,
                                    lecture: i + 1,
                                  })
                                }
                              >
                                Watch
                              </button>
                            )}
                            <span>
                              {humanizeDuration(
                                lecture.lectureDuration * 60 * 1000,
                                { units: ["h", "m"] }
                              )}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* -------- Direct PDF Section (No Dropdown) -------- */}
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                📘 PDF Resources
              </h3>
              {pdfList.length > 0 ? (
                <div className="space-y-3">
                  {pdfList.map((pdf, idx) => (
                    <div
                      key={pdf._id || idx}
                      className="bg-white border border-gray-200 rounded-xl p-4 shadow-md hover:shadow-lg transition"
                    >
                      <h4 className="font-semibold text-lg text-gray-800">
                        {pdf.pdfTitle || `Resource ${idx + 1}`}
                      </h4>
                      {pdf.pdfDescription && (
                        <p className="text-gray-600 text-sm mt-1">
                          {pdf.pdfDescription}
                        </p>
                      )}

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
                          className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                        >
                          Open PDF
                        </button>
                      ) : (
                        <p className="text-sm text-gray-500 italic mt-2">
                          Login / Enroll to access PDF
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No PDFs available for this course.
                </p>
              )}
            </div>

            {/* -------- Rating -------- */}
            <div className="mt-8 flex items-center gap-3">
              <h3 className="text-xl font-semibold">Rate this Course:</h3>
              <Rating initialRating={initialRating} onRate={handleRate} />
            </div>
          </div>

          {/* -------- Right Side: Player -------- */}
          <div className="md:mt-10 space-y-4">
            {playerData ? (
              <div className="bg-white rounded-xl shadow-md p-4">
                <YouTube
                  videoId={getYouTubeVideoId(playerData.lectureUrl)}
                  iframeClassName="w-full aspect-video rounded-xl"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="font-semibold text-lg">
                    {playerData.chapter}.{playerData.lecture}{" "}
                    {playerData.lectureTitle}
                  </p>
                  <button
                    onClick={() => markLectureAsCompleted(playerData.lectureId)}
                    className={`font-medium ${
                      progressData?.lectureCompleted.includes(
                        playerData.lectureId
                      )
                        ? "text-green-600"
                        : "text-blue-600 hover:underline"
                    }`}
                  >
                    {progressData?.lectureCompleted.includes(
                      playerData.lectureId
                    )
                      ? "Completed"
                      : "Mark Complete"}
                  </button>
                </div>
              </div>
            ) : (
              <img
                src={courseData.courseThumbnail}
                alt="Course Thumbnail"
                className="rounded-xl shadow-md w-full"
              />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Player;
