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
  
  // Strip HTML tags from description and truncate
  const stripHtml = (html) => {
    if (!html) return "";
    // Remove HTML tags using regex
    const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    return text;
  };
  
  const fullDescription = course.courseDescription 
    ? stripHtml(course.courseDescription).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    : "No description available.";
  // Description will be limited to 2 lines with CSS line-clamp-2

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/course/${course._id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="relative group block rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 w-full h-full flex flex-col">
      {/* Thumbnail Section - Reduced Height */}
      <div className="relative w-full overflow-hidden bg-gray-50">
        {courseThumbnail && (
          <img
            src={courseThumbnail}
            alt={courseTitle}
            className="w-full h-32 sm:h-36 md:h-40 object-cover"
          />
        )}
      </div>

      {/* White Content Section - Reduced Padding */}
      <div className="p-3 md:p-4 bg-white flex-1 flex flex-col">
        {/* Course Title with Graduation Cap Icon - Left Aligned */}
        <div className="flex items-start gap-2 mb-1">
          <svg
            className="w-4 h-4 text-gray-800 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14l9-5-9-5-9 5 9 5z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14v7M5 12h14"
            />
          </svg>
          <h4 className="text-sm md:text-base font-bold text-gray-900 break-words leading-tight text-left">{courseTitle}</h4>
        </div>

        {/* Educator Name with Person Icon - No Space, Left Aligned */}
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-4 h-4 text-gray-800 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <p className="text-xs md:text-sm font-medium text-orange-500 break-words text-left">{educatorName}</p>
        </div>

        {/* Course Description - Limited to 2 lines, Left Aligned */}
        <p className="text-xs md:text-sm text-gray-700 mb-2 line-clamp-2 text-left">
          {fullDescription}
        </p>

        {/* Rating Section - Left Aligned, Reduced Spacing */}
        <div className="flex items-center gap-1 mb-2 text-left">
          <span className="text-sm md:text-base font-semibold text-gray-900">
            {rating.toFixed(1)}
          </span>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => {
              const starRating = rating - i;
              const isFull = starRating >= 1;
              const isPartial = starRating > 0 && starRating < 1;
              
              return (
                <div key={i} className="relative w-3 h-3 md:w-4 md:h-4">
                  <img
                    src={assets.star_blank}
                    alt="star"
                    className="w-full h-full absolute"
                  />
                  {isFull && (
                    <img
                      src={assets.star}
                      alt="star"
                      className="w-full h-full absolute"
                    />
                  )}
                  {isPartial && (
                    <div className="absolute overflow-hidden" style={{ width: `${starRating * 100}%` }}>
                      <img
                        src={assets.star}
                        alt="star"
                        className="w-full h-full"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-xs md:text-sm text-gray-600 ml-1">
            ({ratingCount})
          </span>
        </div>

        {/* Action Buttons - Reduced Padding */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleButtonClick}
            className="flex-1 bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-xs md:text-sm"
          >
            Register Now
          </button>
          <button
            onClick={handleButtonClick}
            className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-800 font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-xs md:text-sm"
          >
            View Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
