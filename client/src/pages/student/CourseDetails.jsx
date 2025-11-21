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
  const [isLoading, setIsLoading] = useState(false); // Loader for payment

  const {
    backendUrl,
    currency,
    userData,
    fetchUserData,
    fetchUserEnrolledCourses,
    setEnrolledCourses,
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
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ---------------- Toggle Section ----------------
  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // ---------------- Sanitize HTML (Fix SVG width/height auto) ----------------
  const sanitizeHTML = (html) => {
    if (!html) return "";
    // Remove invalid width="auto" and height="auto" attributes from SVG elements
    // SVG will use CSS for sizing instead
    return html
      .replace(/\s+width\s*=\s*["']auto["']/gi, "")
      .replace(/\s+height\s*=\s*["']auto["']/gi, "");
  };

  // ---------------- Enroll Course (Razorpay Checkout) ----------------
  const enrollCourse = async () => {
    let checkoutLaunched = false;

    if (!id) {
      toast.error("Course ID is missing");
      return;
    }

    if (!userData) {
      toast.error("Please sign in to enroll.");
      return;
    }

    if (!window.Razorpay) {
      toast.error("Payment SDK not loaded. Please refresh and try again.");
      return;
    }

    try {
      setIsLoading(true);

      const token = await getToken();
      if (!token) {
        toast.error("Unable to authenticate request. Please login again.");
        return;
      }

      // 1️⃣ Create Razorpay order
      const { data: orderData } = await axios.post(
        `${backendUrl}/api/course/purchase/create-order`,
        { courseId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!orderData?.success || !orderData?.orderId) {
        // Show the exact error message from server (includes configuration errors)
        const errorMessage =
          orderData?.message ||
          "Failed to create payment order. Please try again later.";
        toast.error(errorMessage);
        console.error("Razorpay order creation failed:", orderData);
        return;
      }

      const { orderId, amount, currency } = orderData;

      // 2️⃣ Configure Razorpay UI
      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKeyId) {
        toast.error(
          "Payment configuration error: Razorpay Key ID is missing. Please contact support."
        );
        console.error(
          "VITE_RAZORPAY_KEY_ID is not set in environment variables"
        );
        return;
      }

      const options = {
        key: razorpayKeyId,
        amount,
        currency,
        name: "Aparaitech LMS",
        description: "Course Purchase",
        order_id: orderId,

        theme: { color: "#2563EB" },

        prefill: {
          name:
            userData?.name ||
            userData?.firstName ||
            userData?.fullName ||
            userData?.email,
          email: userData?.email,
        },

        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              `${backendUrl}/api/course/purchase/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              toast.success("🎉 Payment Successful! You are now enrolled.");
              if (Array.isArray(verifyRes.data.enrolledCourses)) {
                setEnrolledCourses(verifyRes.data.enrolledCourses);
              }
              await Promise.all([
                fetchCourseData(),
                fetchUserData(),
                fetchUserEnrolledCourses(),
              ]);
              setIsAlreadyEnrolled(true);
            } else {
              toast.error(
                verifyRes.data.message || "Payment verification failed."
              );
            }
          } catch (error) {
            const serverMessage =
              error.response?.data?.message ||
              (error.response?.status === 503
                ? "Payment service is unavailable. Please try again later."
                : null);
            toast.error(serverMessage || error.message);
          } finally {
            setIsLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled.");
            setIsLoading(false);
          },
        },
      };

      // 4️⃣ Open Razorpay Popup
      const rzp = new window.Razorpay(options);
      rzp.open();
      checkoutLaunched = true;
    } catch (error) {
      // Handle configuration errors (503) and other errors
      const serverMessage =
        error.response?.data?.message ||
        (error.response?.status === 503
          ? "Payment service is temporarily unavailable. Please contact support."
          : null);

      // Log full error for debugging
      console.error("Payment error:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        error: error.response?.data?.error,
      });

      toast.error(
        serverMessage || error.message || "Payment failed. Try again."
      );
    } finally {
      if (!checkoutLaunched) {
        setIsLoading(false);
      }
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

        {/* ---------- LEFT SIDE ---------- */}
        <div className="max-w-xl z-10 text-gray-500">
          <h1 className="md:text-course-deatails-heading-large text-course-deatails-heading-small font-semibold text-gray-800">
            {courseData.courseTitle}
          </h1>

          <p
            className="pt-4 md:text-base text-sm"
            dangerouslySetInnerHTML={{
              __html: sanitizeHTML(courseData.courseDescription.slice(0, 200)),
            }}
          ></p>

          {/* Ratings */}
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
                  className="w-4 h-4"
                />
              ))}
            </div>
            <p className="text-blue-600">
              ({courseData.courseRatings.length} ratings)
            </p>
            <p>{courseData.enrolledStudents.length} students</p>
          </div>

          {/* Course Structure */}
          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Course Structure</h2>
            <div className="pt-5">
              {courseData.courseContent.map((chapter, index) => (
                <div
                  key={index}
                  className="border border-gray-300 bg-white mb-2 rounded shadow-sm"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={assets.down_arrow_icon}
                        alt="arrow"
                        className={`transform transition-transform ${
                          openSections[index] ? "rotate-180" : ""
                        }`}
                      />
                      <p className="font-medium">{chapter.chapterTitle}</p>
                    </div>
                    <p className="text-sm">
                      {chapter.chapterContent.length} lectures •{" "}
                      {calculateChapterTime(chapter)}
                    </p>
                  </div>

                  {/* Lectures */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openSections[index] ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className="flex items-start gap-2 py-1">
                          <img
                            src={assets.play_icon}
                            alt=""
                            className="w-4 h-4 mt-1"
                          />

                          <div className="flex justify-between w-full text-xs">
                            <p>{lecture.lectureTitle}</p>

                            <div className="flex gap-2">
                              {lecture.isPreviewFree && (
                                <button
                                  onClick={() =>
                                    setPlayerData({
                                      videoId: lecture.lectureUrl
                                        .split("/")
                                        .pop(),
                                    })
                                  }
                                  className="text-blue-500 hover:underline"
                                >
                                  Preview
                                </button>
                              )}

                              <p>
                                {humanizeDuration(
                                  lecture.lectureDuration * 60000,
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

          {/* PDFs */}
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
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {pdf.pdfTitle}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          <div className="py-10 text-sm">
            <h3 className="text-xl font-semibold text-gray-800">
              Course Description
            </h3>
            <p
              className="rich-text pt-3"
              dangerouslySetInnerHTML={{
                __html: sanitizeHTML(courseData.courseDescription),
              }}
            ></p>
          </div>
        </div>

        {/* ---------- RIGHT SIDE PAYMENT CARD ---------- */}
        <div className="max-w-course-card z-10 shadow-lg rounded overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
          {playerData ? (
            <YouTube
              videoId={playerData.videoId}
              opts={{ playerVars: { autoplay: 1 } }}
              iframeClassName="w-full aspect-video"
            />
          ) : (
            <img src={courseData.courseThumbnail} alt="" className="w-full" />
          )}

          <div className="p-5">
            <div className="flex items-center gap-2">
              <img className="w-4" src={assets.time_left_clock_icon} alt="" />
              <p className="text-red-500">
                <span className="font-medium">5 days</span> left at this price!
              </p>
            </div>

            {/* Price */}
            <div className="flex gap-3 items-center pt-2">
              <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
                {currency}
                {(
                  courseData.coursePrice -
                  (courseData.discount * courseData.coursePrice) / 100
                ).toFixed(2)}
              </p>

              <p className="text-lg text-gray-500 line-through">
                {currency}
                {courseData.coursePrice}
              </p>

              <p className="text-lg text-gray-500">
                {courseData.discount}% off
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center text-sm gap-4 pt-4 text-gray-500">
              <div className="flex items-center gap-1">
                <img src={assets.star} alt="" />
                <p>{calculateRating(courseData)}</p>
              </div>

              <div className="h-4 w-px bg-gray-500/40"></div>

              <div className="flex items-center gap-1">
                <img src={assets.time_clock_icon} alt="" />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>

              <div className="h-4 w-px bg-gray-500/40"></div>

              <div className="flex items-center gap-1">
                <img src={assets.lesson_icon} alt="" />
                <p>{calculateNoOfLectures(courseData)} lessons</p>
              </div>
            </div>

            {/* ENROLL BUTTON */}
            <button
              onClick={enrollCourse}
              disabled={isLoading || isAlreadyEnrolled}
              className={`mt-6 w-full py-3 rounded font-medium transition ${
                isAlreadyEnrolled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
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
