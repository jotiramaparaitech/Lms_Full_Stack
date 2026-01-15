import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { assets, dummyTestimonial } from "../../assets/assets";
import { Link } from "react-router-dom";

const SCROLL_DURATION = 60; // desktop speed
let scrollTimeout;

const TestimonialsSection = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const controls = useAnimation();
  const trackRef = useRef(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const truncateText = (text, max = 150) =>
    text.length > max ? text.slice(0, max) + "..." : text;

  const startScroll = () => {
    if (!trackRef.current) return;
    const width = trackRef.current.scrollWidth / 2;

    controls.start({
      x: -width,
      transition: {
        duration: SCROLL_DURATION,
        ease: "linear",
        repeat: Infinity,
      },
    });
  };

  // ✅ Mouse / Trackpad Scroll Support
  const handleWheel = (e) => {
    if (!trackRef.current) return;

    e.preventDefault();
    controls.stop();

    trackRef.current.scrollLeft += e.deltaY * 1.2;

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      startScroll();
    }, 600);
  };

  useEffect(() => {
    if (window.innerWidth >= 768) {
      startScroll();
    }
  }, []);

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-blue-800">
          Testimonials
        </h2>
        <p className="md:text-lg text-base text-gray-600 text-center mt-3 max-w-2xl mx-auto">
          Hear from our learners as they share their journeys of transformation,
          success, and how our platform has made a difference in their lives.
        </p>

        {/* ================= DESKTOP ================= */}
        <div
          className="relative mt-16 overflow-hidden hidden md:block"
          onWheel={handleWheel}
        >
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

          <motion.div
            ref={trackRef}
            className="flex gap-6 w-max py-4"
            animate={controls}
            initial={{ x: 0 }}
            onHoverStart={() => controls.stop()}
            onHoverEnd={startScroll}
          >
            {[...dummyTestimonial, ...dummyTestimonial].map(
              (testimonial, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <TestimonialCard
                    testimonial={testimonial}
                    index={index}
                    expandedIndex={expandedIndex}
                    toggleExpand={toggleExpand}
                    truncateText={truncateText}
                  />
                </div>
              )
            )}
          </motion.div>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="grid md:hidden grid-cols-1 gap-10 mt-16 px-3 sm:px-10">
          {dummyTestimonial.slice(0, 3).map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg">
              <TestimonialCard
                testimonial={testimonial}
                index={index}
                expandedIndex={expandedIndex}
                toggleExpand={toggleExpand}
                truncateText={truncateText}
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-16">
          <Link
            to="/AllTestimonials"
            className="inline-block px-8 py-3 text-base font-semibold
                       bg-gradient-to-r from-blue-600 to-purple-600
                       text-white rounded-xl shadow-md
                       hover:scale-105 hover:shadow-lg transition-all duration-300"
          >
            View All Testimonials
          </Link>
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({
  testimonial,
  index,
  expandedIndex,
  toggleExpand,
  truncateText,
}) => {
  const isExpanded = expandedIndex === index;
  const needsTruncate = testimonial.feedback.length > 150;

  return (
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
          <h1 className="text-base md:text-lg font-bold text-blue-900 truncate">
            {testimonial.name || "Anonymous User"}
          </h1>
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
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(index);
          }}
          className="text-blue-600 font-medium hover:text-blue-800 text-xs md:text-sm mt-1"
        >
          {isExpanded ? "Show less" : "Read more"}
        </button>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs md:text-sm text-gray-500 italic truncate">
          {testimonial.role || "Learner"} | {testimonial.name || "Anonymous"}
        </p>
      </div>
    </div>
  );
};

export default TestimonialsSection;
