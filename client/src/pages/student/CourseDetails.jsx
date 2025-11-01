import React, { useContext, useEffect, useState } from "react";
import Footer from "../../components/student/Footer";
import { assets } from "../../assets/assets";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import humanizeDuration from "humanize-duration";
import YouTube from "react-youtube";
import { useAuth } from "@clerk/clerk-react";
import Loading from "../../components/student/Loading";

const CourseDetails = () => {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const {
    backendUrl,
    currency,
    userData,
    calculateChapterTime,
    calculateCourseDuration,
    calculateRating,
    calculateNoOfLectures,
  } = useContext(AppContext);
  const { getToken } = useAuth();

  // ---------------- Fetch Course Data ----------------
  const fetchCourseData = async () => {
    try {
      if (!id) return toast.error("Course ID is missing");

      const { data } = await axios.get(`${backendUrl}/api/course/${id}`);
      if (data.success) {
        setCourseData(data.courseData);
      } else {
        toast.error(data.message || "Failed to fetch course data.");
        console.error("Fetch course error:", data);
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Fetch course error:", error);
    }
  };

  // ---------------- Toggle Section ----------------
  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // ---------------- Enroll Course (Stripe Payment) ----------------
  const enrollCourse = async () => {
    try {
      if (!userData) return toast.warn("Login to enroll");
      if (isAlreadyEnrolled) return toast.warn("Already enrolled");
      if (!courseData?._id) return toast.error("Invalid course data");

      setIsLoading(true);
      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/course/purchase/stripe-session`,
        { courseId: courseData._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Stripe session response:", data);

      if (data.success && data.session_url) {
        // Redirect user to Stripe Checkout
        window.location.href = data.session_url;
      } else {
        toast.error(data.message || "Failed to initiate payment.");
      }
    } catch (error) {
      console.error("Stripe session error:", error.response || error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Check Enrollment ----------------
  useEffect(() => {
    fetchCourseData();
  }, [id]);

  useEffect(() => {
    if (userData && courseData) {
      setIsAlreadyEnrolled(
        userData.enrolledCourses?.some(
          (courseId) => courseId.toString() === courseData._id.toString()
        )
      );
    }
  }, [userData, courseData]);

  // ---------------- Main Render ----------------
  if (!courseData) return <Loading />;

  return (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-20 pt-10 text-left">
        <div className="absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient-to-b from-cyan-100/70"></div>

        {/* ---------- LEFT SIDE: Course Content ---------- */}
        <div className="max-w-xl z-10 text-gray-500">
          <h1 className="md:text-course-deatails-heading-large text-course-deatails-heading-small font-semibold text-gray-800">
            {courseData.courseTitle}
          </h1>
          <p
            className="pt-4 md:text-base text-sm"
            dangerouslySetInnerHTML={{
              __html: courseData.courseDescription.slice(0, 200),
            }}
          ></p>

          <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
            <p>{calculateRating(courseData)}</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={
                    i < Math.floor(calculateRating(courseData))
                      ? assets.star
                      : assets.star_blank
                  }
                  alt="star"
                  className="w-3.5 h-3.5"
                />
              ))}
            </div>
            <p className="text-blue-600">
              ({courseData.courseRatings.length}{" "}
              {courseData.courseRatings.length > 1 ? "ratings" : "rating"})
            </p>
            <p>
              {courseData.enrolledStudents.length}{" "}
              {courseData.enrolledStudents.length > 1 ? "students" : "student"}
            </p>
          </div>

          <p className="text-sm">
            Course by{" "}
            <span className="text-blue-600 underline">
              {courseData?.educator?.name || "Unknown Educator"}
            </span>
          </p>

          {/* ---------- Course Structure ---------- */}
          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Course Structure</h2>
            <div className="pt-5">
              {courseData.courseContent.map((chapter, index) => (
                <div
                  key={index}
                  className="border border-gray-300 bg-white mb-2 rounded"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={assets.down_arrow_icon}
                        alt="arrow icon"
                        className={`transform transition-transform ${
                          openSections[index] ? "rotate-180" : ""
                        }`}
                      />
                      <p className="font-medium md:text-base text-sm">
                        {chapter.chapterTitle}
                      </p>
                    </div>
                    <p className="text-sm md:text-default">
                      {chapter.chapterContent.length} lectures -{" "}
                      {calculateChapterTime(chapter)}
                    </p>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openSections[index] ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className="flex items-start gap-2 py-1">
                          <img
                            src={assets.play_icon}
                            alt="bullet icon"
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                            <p>{lecture.lectureTitle}</p>
                            <div className="flex gap-2">
                              {lecture.isPreviewFree && (
                                <p
                                  onClick={() =>
                                    setPlayerData({
                                      videoId: lecture.lectureUrl
                                        .split("/")
                                        .pop(),
                                    })
                                  }
                                  className="text-blue-500 cursor-pointer"
                                >
                                  Preview
                                </p>
                              )}
                              <p>
                                {humanizeDuration(
                                  lecture.lectureDuration * 60 * 1000,
                                  { units: ["h", "m"] }
                                )}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ---------- PDF RESOURCES ---------- */}
          {isAlreadyEnrolled && courseData.pdfResources?.length > 0 && (
            <div className="mt-10 mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                📘 Course PDFs
              </h2>
              <ul className="space-y-3">
                {courseData.pdfResources.map((pdf) => (
                  <li key={pdf.pdfId}>
                    <a
                      href={pdf.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 text-sm md:text-base"
                    >
                      {pdf.pdfTitle || "View PDF"}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ---------- Course Description ---------- */}
          <div className="py-10 text-sm md:text-default">
            <h3 className="text-xl font-semibold text-gray-800">
              Course Description
            </h3>
            <p
              className="rich-text pt-3"
              dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}
            ></p>
          </div>
        </div>

        {/* ---------- RIGHT SIDE: Card & Player ---------- */}
        <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
          {playerData ? (
            <YouTube
              videoId={playerData.videoId}
              opts={{ playerVars: { autoplay: 1 } }}
              iframeClassName="w-full aspect-video"
            />
          ) : (
            <img src={courseData.courseThumbnail} alt="" />
          )}
          <div className="p-5">
            <div className="flex items-center gap-2">
              <img
                className="w-3.5"
                src={assets.time_left_clock_icon}
                alt="time left clock icon"
              />
              <p className="text-red-500">
                <span className="font-medium">5 days</span> left at this price!
              </p>
            </div>
            <div className="flex gap-3 items-center pt-2">
              <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
                {currency}
                {(
                  courseData.coursePrice -
                  (courseData.discount * courseData.coursePrice) / 100
                ).toFixed(2)}
              </p>
              <p className="md:text-lg text-gray-500 line-through">
                {currency}
                {courseData.coursePrice}
              </p>
              <p className="md:text-lg text-gray-500">
                {courseData.discount}% off
              </p>
            </div>
            <div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
              <div className="flex items-center gap-1">
                <img src={assets.star} alt="star icon" />
                <p>{calculateRating(courseData)}</p>
              </div>
              <div className="h-4 w-px bg-gray-500/40"></div>
              <div className="flex items-center gap-1">
                <img src={assets.time_clock_icon} alt="clock icon" />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>
              <div className="h-4 w-px bg-gray-500/40"></div>
              <div className="flex items-center gap-1">
                <img src={assets.lesson_icon} alt="lesson icon" />
                <p>{calculateNoOfLectures(courseData)} lessons</p>
              </div>
            </div>
            <button
              onClick={enrollCourse}
              disabled={isLoading}
              className="md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium"
            >
              {isAlreadyEnrolled
                ? "Already Enrolled"
                : isLoading
                ? "Processing..."
                : "Enroll Now"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CourseDetails;
