import React, { useState } from "react";
import { assets, dummyTestimonial } from "../../assets/assets";

const AllTestimonials = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const truncateText = (text, max = 150) =>
    text.length > max ? text.slice(0, max) + "..." : text;

  return (
    <section className="bg-white py-20 px-4 md:px-8">
      {/* Header */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-center text-blue-800">
        What Our Learners Say
      </h1>
      <p className="md:text-lg text-base text-gray-600 text-center mt-3 max-w-2xl mx-auto">
        Real stories from learners who transformed their careers with us.
      </p>

      {/* Testimonials Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                   gap-10 mt-16 max-w-7xl mx-auto"
      >
        {dummyTestimonial.map((testimonial, index) => {
          const isExpanded = expandedIndex === index;
          const needsTruncate = testimonial.feedback.length > 150;

          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex flex-col h-full p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  {testimonial.image ? (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-12 w-12 md:h-14 md:w-14 rounded-full object-cover border-2 border-blue-400"
                    />
                  ) : (
                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg uppercase">
                      {testimonial.name?.charAt(0) || "U"}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="text-base md:text-lg font-bold text-blue-900 truncate">
                      {testimonial.name || "Anonymous User"}
                    </h2>
                    <p className="text-xs md:text-sm text-purple-700 font-medium truncate">
                      {testimonial.role || "Learner"}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <img
                      key={i}
                      className="h-4 w-4 md:h-5 md:w-5"
                      src={
                        i < Math.floor(testimonial.rating || 5)
                          ? assets.star
                          : assets.star_blank
                      }
                      alt="star"
                    />
                  ))}
                </div>

                {/* Feedback */}
                <p className="text-gray-700 leading-relaxed italic text-sm md:text-base">
                  "
                  {isExpanded
                    ? testimonial.feedback
                    : truncateText(testimonial.feedback)}
                  "
                </p>

                {needsTruncate && (
                  <button
                    onClick={() => toggleExpand(index)}
                    className="text-blue-600 font-medium hover:text-blue-800 text-xs md:text-sm mt-1"
                  >
                    {isExpanded ? "Show less" : "Read more"}
                  </button>
                )}

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs md:text-sm text-gray-500 italic truncate">
                    {testimonial.role || "Learner"} |{" "}
                    {testimonial.name || "Anonymous"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AllTestimonials;
