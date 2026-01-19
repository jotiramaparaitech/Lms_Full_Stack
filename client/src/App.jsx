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
import About from "./pages/student/About";
import Contact from "./pages/student/Contact";
import AllProjectsModal from "./components/student/AllProjectsModal";
import { AllProjectsContext } from "./components/student/Navbar";
import InquiryModal from "./components/common/InquiryModal";
import Connect from "./pages/student/Connect";
import AiAssistant from "./components/AiAssistant";

import ScrollToTop from "./components/ScrollToTop";
import AllTestimonials from "./components/student/AllTestimonials";

import StudentDashboard from "./pages/student/StudentDashboard";

import SupportTicketButton from "./components/common/SupportTicketButton";
import SupportTickets from './pages/educator/SupportTickets';

import MyProjects from "./pages/student/MyProjects";
import Tests from "./pages/student/Tests";
import Certificates from "./pages/student/Certificates";
import Progress from "./pages/student/Progress";
import Calendar from "./pages/student/apps/Calendar";
import Todo from "./pages/student/apps/Todo";
import Chat from "./pages/student/apps/Chat";
import Teams from "./pages/student/apps/Teams";

import AssignTeamLeader from "./pages/educator/AssignTeamLeader";
import TeamLeaders from "./pages/educator/TeamLeaders";

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
        <Route path="/AllTestimonials" element={<AllTestimonials />} />
       
        {/* ✅ Student Dashboard Route */}
         <Route path="/student/dashboard" element={<StudentDashboard />} />
         <Route path="/student/projects" element={<MyProjects />} />
         <Route path="/student/tests" element={<Tests />} />
         <Route path="/student/certificates" element={<Certificates />} />
         <Route path="/student/progress" element={<Progress />} />
         <Route path="/student/apps/calendar" element={<Calendar />} />
         <Route path="/student/apps/todo" element={<Todo />} />
         <Route path="/student/apps/chat" element={<Chat />} />
         <Route path="/student/apps/teams" element={<Teams />} />


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
          <Route path="assign-team-leader" element={<AssignTeamLeader />} />
          <Route path="team-leaders" element={<TeamLeaders />} />
          <Route path="tickets" element={<SupportTickets />} />
        </Route>
      </Routes>

      {/* ✅ GLOBAL FOOTER (hidden on educator routes) */}
      {/* {!isEducatorRoute && <Footer />} */}

      <div className="fixed bottom-6 left-6 z-50">
        <AiAssistant />
      </div>
      <div className="fixed bottom-24 right-6 z-50">
  <SupportTicketButton />
</div>

      {/* <ChatbotWidget /> */}
    </div>
  );
};

export default App;
