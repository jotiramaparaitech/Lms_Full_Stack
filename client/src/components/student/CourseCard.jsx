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
        w-[90%]
        min-h-[280px] max-h-[300px]
        sm:w-full sm:min-h-0 sm:max-h-none
      "
    >
      {/* IMAGE */}
      <img
        src={courseThumbnail}
        alt={courseTitle}
        className="
          w-full object-cover
          h-[110px]
          sm:h-36
          md:h-40
        "
      />

      {/* CONTENT */}
      <div className="px-4 py-3 sm:p-3 md:p-4 flex flex-col flex-1 gap-1">
        {/* TITLE */}
        <h4 className="text-[14px] sm:text-sm md:text-base font-semibold leading-tight">
          {courseTitle}
        </h4>

        {/* EDUCATOR */}
        <p className="text-[12px] sm:text-xs md:text-sm text-orange-500">
          {educatorName}
        </p>

        {/* DESCRIPTION */}
        <p className="text-[12px] sm:text-xs md:text-sm text-gray-600 line-clamp-2">
          {description || "No description available"}
        </p>

        {/* RATING */}
        <div className="flex items-center gap-1 mt-auto">
          <span className="text-[13px] font-semibold">{rating.toFixed(1)}</span>
          <span className="text-[12px] text-gray-500">({ratingCount})</span>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 mt-3">
          <button
            onClick={handleClick}
            className="
              flex-1 bg-[#FF6B6B] text-white
              text-[12px]
              py-2
              rounded-md
            "
          >
            Register
          </button>

          <button
            onClick={handleClick}
            className="
              flex-1 border border-gray-300 text-gray-800
              text-[12px]
              py-2
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
