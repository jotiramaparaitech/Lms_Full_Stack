import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const CourseCard = ({ course }) => {
  const { currency, calculateRating } = useContext(AppContext);

  if (!course) return null;

  const educatorName = course.educator?.name || "Unknown Educator";
  const courseThumbnail = course.courseThumbnail || assets.defaultThumbnail;
  const courseTitle = course.courseTitle || "Untitled Course";
  const rating = calculateRating ? calculateRating(course) : 0;
  const ratingCount = course.courseRatings?.length || 0;
  const price = course.coursePrice || 0;
  const discount = course.discount || 0;
  const finalPrice = (price - (discount * price) / 100).toFixed(2);

  return (
    <Link
      to={`/course/${course._id}`}
      onClick={() => scrollTo(0, 0)}
      className="relative group block rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
    >
      {/* Course Thumbnail */}
      <div className="relative overflow-hidden">
        <img
          src={courseThumbnail}
          alt={courseTitle}
          className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />

        {/* Corrected Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-t-lg"></div>

        {/* Floating Discount Tag */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 text-left">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {courseTitle}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{educatorName}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <img
              key={i}
              src={i < Math.floor(rating) ? assets.star : assets.star_blank}
              alt="star"
              className="w-4 h-4"
            />
          ))}
          <p className="text-xs text-gray-500 ml-1">
            {rating.toFixed(1)} ({ratingCount})
          </p>
        </div>

        {/* Price Section */}
        <div className="mt-3 flex items-center gap-2">
          <p className="text-lg font-bold text-gray-900">
            {currency}
            {finalPrice}
          </p>
          {discount > 0 && (
            <p className="text-sm text-gray-400 line-through">
              {currency}
              {price}
            </p>
          )}
        </div>
      </div>

      {/* Glow Border Animation */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-400/60 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-500"></div>
    </Link>
  );
};

export default CourseCard;
