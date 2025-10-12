import React from "react";
import { assets, dummyTestimonial } from "../../assets/assets";

const TestimonialsSection = () => {
  return (
    <div className="pb-20 px-4 md:px-8 bg-[#ffffff]">
      {/* Section Header */}
      <h2 className="text-4xl md:text-5xl font-extrabold pt-9 text-center text-blue-800 tracking-wide">
        Testimonials
      </h2>
      <p className="md:text-lg text-base text-gray-600 text-center mt-3 max-w-2xl mx-auto">
        Hear from our learners as they share their journeys of transformation,
        success, and how our platform has made a difference in their lives.
      </p>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-10 mt-16 px-7 sm:px-10 md:px-20">
        {dummyTestimonial.map((testimonial, index) => (
          <div
            key={index}
            className="group relative bg-white border border-transparent rounded-2xl shadow-md
                       hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2"
          >
            <div className="relative z-10">
              {/* Card Header */}
              <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-t-2xl">
                <img
                  className="h-14 w-14 rounded-full object-cover border-2 border-blue-400"
                  src={testimonial.image}
                  alt={testimonial.name}
                />
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-blue-900">
                    {testimonial.name}
                  </h1>
                  <p className="text-sm md:text-base text-purple-700 font-medium">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 pb-7">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <img
                      key={i}
                      className="h-5"
                      src={
                        i < Math.floor(testimonial.rating)
                          ? assets.star
                          : assets.star_blank
                      }
                      alt="star"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mt-5 leading-relaxed italic text-base md:text-lg">
                  “{testimonial.feedback}”
                </p>
              </div>

              {/* Read More Button */}
              <div className="px-5 pb-4">
                <a
                  href="#"
                  className="inline-block px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600
                             text-white font-semibold rounded-xl shadow-md
                             hover:scale-105 hover:shadow-lg transition-transform duration-300"
                >
                  Read more
                </a>
              </div>

              {/* Bottom Card Text */}
              <div className="px-5 pb-4">
                <p className="text-sm md:text-base text-gray-500 italic tracking-wide">
                  {testimonial.role} | {testimonial.name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;
