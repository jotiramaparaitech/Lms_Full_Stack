import React, { useContext } from "react";
import { Routes, Route, Navigate, useMatch } from "react-router-dom";
import { AppContext } from "./context/AppContext";
import Navbar, { AllProjectsProvider } from "./components/student/Navbar";
import Footer from "./components/student/Footer";

import Home from "./pages/student/Home";
import CourseDetails from "./pages/student/CourseDetails";
import CoursesList from "./pages/student/CoursesList";
import Dashboard from "./pages/educator/Dashboard";
import AddCourse from "./pages/educator/AddCourse";
import EditCourse from "./pages/educator/EditCourse";
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import Educator from "./pages/educator/Educator";
import AssignCourse from "./pages/educator/AssignCourse";

import "quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import Player from "./pages/student/Player";
import MyEnrollments from "./pages/student/MyEnrollments";
import Loading from "./components/student/Loading";
import WhatsAppButton from "./components/common/WhatsAppButton";
import About from "./pages/student/About";
import Contact from "./pages/student/Contact";
import AllProjectsModal from "./components/student/AllProjectsModal";
import { AllProjectsContext } from "./components/student/Navbar";
import InquiryModal from "./components/common/InquiryModal";
import Connect from "./pages/student/Connect";
import AiAssistant from "./components/AiAssistant";

import ScrollToTop from "./components/ScrollToTop";

const App = () => {
  const { isEducator } = useContext(AppContext);
  const isEducatorRoute = useMatch("/educator/*");

  return (
    <AllProjectsProvider>
      <AppContent isEducatorRoute={isEducatorRoute} isEducator={isEducator} />
    </AllProjectsProvider>
  );
};

const AppContent = ({ isEducatorRoute, isEducator }) => {
  const { isAllProjectsOpen, setIsAllProjectsOpen } =
    useContext(AllProjectsContext);

  return (
    <div className="text-default min-h-screen bg-white relative">
      <ToastContainer />

      {/* ✅ Student Navbar (hidden on educator routes) */}
      {!isEducatorRoute && <Navbar />}

      {/* ✅ All Projects Modal */}
      {!isEducatorRoute && (
        <AllProjectsModal
          isOpen={isAllProjectsOpen}
          onClose={() => setIsAllProjectsOpen(false)}
        />
      )}

      {/* ✅ Inquiry Modal */}
      {/* {!isEducatorRoute && <InquiryModal />} */}

      {/* ================= ROUTES ================= */}
      <ScrollToTop />
      <Routes>
        {/* 🧩 Student Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course-list/:input" element={<CoursesList />} />
        <Route path="/my-enrollments" element={<MyEnrollments />} />
        <Route path="/player/:courseId" element={<Player />} />
        <Route path="/loading/:path" element={<Loading />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/connect" element={<Connect />} />

        {/* 🧑‍🏫 Educator Routes (Protected) */}
        <Route
          path="/educator/*"
          element={isEducator ? <Educator /> : <Navigate to="/" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="course/:courseId/edit" element={<EditCourse />} />
          <Route path="student-enrolled" element={<StudentsEnrolled />} />
          <Route path="assign-course" element={<AssignCourse />} />
        </Route>
      </Routes>

      {/* ✅ GLOBAL FOOTER (hidden on educator routes) */}
      {/* {!isEducatorRoute && <Footer />} */}

      {/* 🤖 AI Assistant -> BOTTOM LEFT */}
      <div className="fixed bottom-6 right-6 z-50">
        <AiAssistant />
      </div>

      {/* 💬 WhatsApp -> BOTTOM RIGHT */}
      {/* Wrapped in a div to force it to the right side if it doesn't do it automatically */}
      <div className="fixed bottom-6 right-6 z-50">
        <WhatsAppButton />
      </div>
      {/* <ChatbotWidget /> */}
    </div>
  );
};

export default App;
