import React, { useContext } from "react";
import { Routes, Route, Navigate, useMatch } from "react-router-dom";
import { AppContext } from "./context/AppContext";
import Navbar from "./components/student/Navbar";
import Home from "./pages/student/Home";
import CourseDetails from "./pages/student/CourseDetails";
import CoursesList from "./pages/student/CoursesList";
import Dashboard from "./pages/educator/Dashboard";
import AddCourse from "./pages/educator/AddCourse";
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import Educator from "./pages/educator/Educator";
import AssignCourse from "./pages/educator/AssignCourse"; // ✅ Added import here
import "quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Player from "./pages/student/Player";
import MyEnrollments from "./pages/student/MyEnrollments";
import Loading from "./components/student/Loading";
import WhatsAppButton from "./components/common/WhatsAppButton";
import ChatbotWidget from "./components/common/ChatbotWidget";
import About from "./pages/student/About";

const App = () => {
  const { isEducator } = useContext(AppContext);
  const isEducatorRoute = useMatch("/educator/*");

  return (
    <div className="text-default min-h-screen bg-white relative">
      <ToastContainer />

      {/* ✅ Student Navbar (Hidden on educator routes) */}
      {!isEducatorRoute && <Navbar />}

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

        {/* 🧑‍🏫 Educator Routes (Protected) */}
        <Route
          path="/educator/*"
          element={isEducator ? <Educator /> : <Navigate to="/" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="student-enrolled" element={<StudentsEnrolled />} />
          <Route path="assign-course" element={<AssignCourse />} />{" "}
          {/* ✅ Fixed path */}
        </Route>
      </Routes>

      {/* 💬 WhatsApp Floating Button */}
      <WhatsAppButton />
      {/* <ChatbotWidget /> */}
    </div>
  );
};

export default App;
