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
        w-full max-w-[380px]
        mx-auto
        hover:shadow-lg transition
      "
    >
      {/* IMAGE */}
      <div className="relative">
        <img
          src={courseThumbnail}
          alt={courseTitle}
          className="w-full h-[160px] object-cover"
        />

        {course.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {course.discount}% OFF
          </span>
        )}

        {course.isTrending && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full">
            Trending
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-1 p-4 gap-2 text-left">
        <h4 className="font-semibold text-base leading-snug">{courseTitle}</h4>

        <p className="text-sm text-orange-500">{educatorName}</p>

        <p className="text-sm text-gray-600 line-clamp-3">
          {description || "No description available"}
        </p>

        {/* ⭐ RATING WITH STARS (LEFT ALIGNED) */}
        <div className="flex items-center gap-1 mt-auto">
          {[...Array(5)].map((_, index) => (
            <img
              key={index}
              src={index < Math.round(rating) ? assets.star : assets.star_blank}
              alt="star"
              className="h-4"
            />
          ))}
          <span className="ml-1 text-sm font-semibold">
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">({ratingCount})</span>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleClick}
            className="flex-1 bg-[#FF6B6B] text-white py-2 rounded-md text-sm"
          >
            Register
          </button>

          <button
            onClick={handleClick}
            className="flex-1 border py-2 rounded-md text-sm"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
