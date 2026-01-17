import StudentSidebar from "./StudentSidebar";

const StudentLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <StudentSidebar />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
};

export default StudentLayout;
