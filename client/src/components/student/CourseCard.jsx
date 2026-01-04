import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const CourseCard = ({ course }) => {
  const { calculateRating } = useContext(AppContext);
  const navigate = useNavigate();

  if (!course) return null;

  const educatorName = course.educator?.name || "Unknown Educator";
  const courseThumbnail = course.courseThumbnail || assets.defaultThumbnail;
  const courseTitle = course.courseTitle || "Untitled Course";
  const rating = calculateRating ? calculateRating(course) : 0;
  const ratingCount = course.courseRatings?.length || 0;

  const stripHtml = (html) =>
    html
      ? html
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .trim()
      : "";

  const description = stripHtml(course.courseDescription);

  const handleClick = () => {
    navigate(`/course/${course._id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div
      className="
        bg-white rounded-xl shadow-md border border-gray-100
        overflow-hidden flex flex-col
        mx-auto
        w-[88%]
        min-h-[310px]          /* INCREASED MOBILE HEIGHT */
        sm:w-full sm:min-h-0
      "
    >
      {/* IMAGE */}
      <img
        src={courseThumbnail}
        alt={courseTitle}
        className="
          w-full object-cover
          h-[120px]            /* TALLER MOBILE IMAGE */
          sm:h-36 md:h-40
        "
      />

      {/* CONTENT */}
      <div
        className="
          px-4 py-4            /* MORE VERTICAL SPACE */
          sm:p-3 md:p-4
          flex flex-col flex-1 gap-2
          text-left            /* LEFT ALIGN TEXT */
        "
      >
        {/* TITLE */}
        <h4 className="text-[15px] sm:text-sm md:text-base font-semibold leading-snug">
          {courseTitle}
        </h4>

        {/* EDUCATOR */}
        <p className="text-[13px] sm:text-xs md:text-sm text-orange-500">
          {educatorName}
        </p>

        {/* DESCRIPTION */}
        <p className="text-[13px] sm:text-xs md:text-sm text-gray-600 line-clamp-3">
          {description || "No description available"}
        </p>

        {/* RATING */}
        <div className="flex items-center gap-1 mt-auto">
          <span className="text-[13px] font-semibold">{rating.toFixed(1)}</span>
          <span className="text-[12px] text-gray-500">({ratingCount})</span>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleClick}
            className="
              flex-1 bg-[#FF6B6B] text-white
              text-[13px]
              py-2.5
              rounded-md
            "
          >
            Register
          </button>

          <button
            onClick={handleClick}
            className="
              flex-1 border border-gray-300 text-gray-800
              text-[13px]
              py-2.5
              rounded-md
            "
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
