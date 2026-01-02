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
      <Hero id="hero" />
      <Features />
      <Companies />
      <div id="courses">
        <CoursesSection />
      </div>
      <TestimonialsSection />
      <CallToAction />
      {/* ✅ Added ID for smooth scroll from Navbar */}
      <div id="contact-section" className="w-full">
        <Footer />
      </div>
    </div>
  );
};

export default Home;
