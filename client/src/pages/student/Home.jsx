import React from "react";
import Footer from "../../components/student/Footer";
import Hero from "../../components/student/Hero";
import Companies from "../../components/student/Companies";
import Features from "../../components/student/Features";
import CoursesSection from "../../components/student/CoursesSection";
import TestimonialsSection from "../../components/student/TestimonialsSection";
import CallToAction from "../../components/student/CallToAction";

const Home = () => {
  return (
    <div className="flex flex-col items-center text-center">
      
      {/* Hero Section */}
      <div id="hero" className="w-full">
        <Hero />
      </div>

      {/* Features / Services Section */}
      <div id="features" className="w-full">
        <Features />
      </div>

      {/* Companies Section */}
      <div id="companies" className="w-full">
        <Companies />
      </div>

      {/* Courses Section */}
      <div id="courses" className="w-full">
        <CoursesSection />
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="w-full">
        <TestimonialsSection />
      </div>

      <CallToAction />

      {/* Footer / Contact Section */}
      <div id="contact-section" className="w-full">
        <Footer />
      </div>
    </div>
  );
};

export default Home;