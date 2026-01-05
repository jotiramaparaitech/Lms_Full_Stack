import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const CourseCard = ({ course }) => {
  const { calculateRating } = useContext(AppContext);
  const navigate = useNavigate();

  if (!course) return null;

  const educatorName = course.educator?.name || "Unknown Educator";
  const thumbnail = course.courseThumbnail || assets.defaultThumbnail;
  const title = course.courseTitle || "Untitled Course";

  const rating = calculateRating ? calculateRating(course) : 0;
  const ratingCount = course.courseRatings?.length || 0;

  const stripHtml = (html) =>
    html
      ?.replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

  const description = stripHtml(course.courseDescription);

  const handleNavigate = () => {
    navigate(`/course/${course._id}`);
    window.scrollTo(0, 0);
  };

  const renderStars = () => {
    const fullStars = Math.round(rating);
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-sm ${
              i < fullStars ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
      {/* Thumbnail */}
      <img
        src={thumbnail}
        alt={title}
        className="w-full h-44 sm:h-48 object-cover"
      />

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 text-left">
        <h4 className="text-sm sm:text-base font-semibold text-gray-800 leading-snug">
          {title}
        </h4>

        <p className="mt-1 text-xs sm:text-sm text-orange-500 font-medium">
          {educatorName}
        </p>

        <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-3">
          {description || "No description available"}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-4">
          {renderStars()}
          <span className="text-xs text-gray-500">
            {rating.toFixed(1)} ({ratingCount})
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-auto pt-4">
          <button
            onClick={handleNavigate}
            className="flex-1 bg-[#FF6B6B] text-white text-xs sm:text-sm py-2.5 rounded-lg hover:opacity-90 transition"
          >
            Register
          </button>

          <button
            onClick={handleNavigate}
            className="flex-1 border border-gray-300 text-gray-800 text-xs sm:text-sm py-2.5 rounded-lg hover:bg-gray-50 transition"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
