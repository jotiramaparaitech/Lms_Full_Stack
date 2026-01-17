import StudentLayout from "../../../components/student/StudentLayout";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  Filter,
  MessageSquare,
  Video,
  Calendar,
  FileText,
  Github,
  ExternalLink,
  UserPlus,
  MoreVertical,
  UserCheck,
  Users as TeamIcon,
  FolderKanban,
  BookOpen,
  Award,
  Clock,
  Mail,
  ChevronRight,
  Eye,
  Link,
  Download,
  Share2,
  Bell,
  Settings
} from "lucide-react";

const Teams = () => {
  const { userData, enrolledCourses = [] } = useContext(AppContext) || {};
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTeam, setActiveTeam] = useState(null);
  const navigate = useNavigate();

  // Fetch teams based on enrolled courses
  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        setLoading(true);
        
        // If user has enrolled courses, fetch their details
        if (enrolledCourses.length > 0) {
          const formattedTeams = [];
          
          // For each enrolled course, create a team
          for (const course of enrolledCourses) {
            // Check if course has enrolledStudents
            if (course.enrolledStudents && course.enrolledStudents.length > 0) {
              try {
                // Fetch enrolled students' details
                const response = await fetch(`/api/courses/${course._id}/enrolled-students`);
                const enrolledStudentsData = await response.json();
                
                // Filter out current user from members list
                const members = enrolledStudentsData.filter(
                  student => student._id !== userData?._id
                );
                
                // Only create team if there are other enrolled students
                if (members.length > 0) {
                  const team = {
                    _id: course._id,
                    courseId: course._id,
                    courseTitle: course.courseTitle,
                    courseDescription: course.courseDescription,
                    courseThumbnail: course.courseThumbnail,
                    coursePrice: course.coursePrice,
                    discount: course.discount,
                    educator: course.educator,
                    teamName: `${course.courseTitle} Team`,
                    members: members.map(student => ({
                      _id: student._id,
                      name: student.name,
                      email: student.email,
                      imageUrl: student.imageUrl,
                      role: "Student",
                      enrolledDate: student.enrolledDate,
                      progress: calculateStudentProgress(student, course._id)
                    })),
                    totalMembers: enrolledStudentsData.length,
                    projectStatus: "Active",
                    progress: calculateCourseProgress(course),
                    resources: course.pdfResources || [],
                    meetings: [], // This would come from a separate meetings API
                    tasks: [], // This would come from a separate tasks API
                    createdAt: course.createdAt
                  };
                  
                  formattedTeams.push(team);
                }
              } catch (error) {
                console.error(`Error fetching students for course ${course._id}:`, error);
              }
            }
          }
          
          setTeams(formattedTeams);
          
          // Set first team as active if available
          if (formattedTeams.length > 0) {
            setActiveTeam(formattedTeams[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching teams data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamsData();
  }, [enrolledCourses, userData]);

  // Helper function to calculate student progress (you would implement this based on your data)
  const calculateStudentProgress = (student, courseId) => {
    // This should come from your backend - for now returning mock progress
    return Math.floor(Math.random() * 100);
  };

  // Helper function to calculate course progress
  const calculateCourseProgress = (course) => {
    if (!course.courseContent || course.courseContent.length === 0) return 0;
    
    // Calculate based on completed lectures (this is simplified)
    let totalLectures = 0;
    let completedLectures = 0;
    
    course.courseContent.forEach(chapter => {
      totalLectures += chapter.chapterContent.length;
      // You would need to track which lectures each student has completed
      // For now, using a mock calculation
      completedLectures += Math.floor(chapter.chapterContent.length * 0.6);
    });
    
    return totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
  };

  // Filter teams based on search
  const filteredTeams = teams.filter(team =>
    team.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle send message
  const handleSendMessage = (member) => {
    navigate(`/student/apps/chat?user=${member._id}`);
  };

  // Handle schedule meeting
  const handleScheduleMeeting = (team) => {
    navigate(`/student/apps/calendar?team=${team._id}`);
  };

  // Handle view course
  const handleViewCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  // Handle invite to team
  const handleInviteToTeam = async (teamId) => {
    try {
      const inviteLink = `${window.location.origin}/course/${teamId}/join`;
      await navigator.clipboard.writeText(inviteLink);
      alert("Invite link copied to clipboard!");
    } catch (error) {
      console.error("Error copying invite link:", error);
    }
  };

  // Handle download resource
  const handleDownloadResource = (resource) => {
    window.open(resource.pdfUrl, '_blank');
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Teams</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading teams...</p>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Teams</h1>
            <p className="text-gray-600 mt-1">
              Collaborate with students assign in the same projects
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search teams or projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        {teams.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <TeamIcon size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Teams Found</h3>
            <p className="text-gray-600 mb-6">
              You're not assign in any projects with other students yet.
            </p>
            <button
              onClick={() => navigate("/course-list")}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Browse Projects
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Teams List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">
                    My Teams ({filteredTeams.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {filteredTeams.map((team) => (
                    <div
                      key={team._id}
                      onClick={() => setActiveTeam(team)}
                      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                        activeTeam?._id === team._id ? 'bg-cyan-50 border-l-4 border-cyan-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {team.courseThumbnail ? (
                            <img
                              src={team.courseThumbnail}
                              alt={team.courseTitle}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-lg flex items-center justify-center">
                              <BookOpen size={20} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {team.teamName}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
                            {team.courseTitle}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Users size={14} />
                              <span>{team.totalMembers} members</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <FolderKanban size={14} />
                              <span>{team.progress}% progress</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Active Team Details */}
            {activeTeam && (
              <div className="lg:col-span-2">
                {/* Team Header */}
                <div className="bg-white rounded-xl shadow mb-6 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {activeTeam.courseThumbnail ? (
                          <img
                            src={activeTeam.courseThumbnail}
                            alt={activeTeam.courseTitle}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-lg flex items-center justify-center">
                            <BookOpen size={24} className="text-white" />
                          </div>
                        )}
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {activeTeam.teamName}
                          </h2>
                          <p className="text-gray-600 mt-1">{activeTeam.courseDescription}</p>
                          <div className="flex flex-wrap gap-4 mt-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Users size={16} className="text-gray-500" />
                              <span className="text-gray-700">{activeTeam.totalMembers} members</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Award size={16} className="text-gray-500" />
                              <span className="text-gray-700">Educator: {activeTeam.educator}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock size={16} className="text-gray-500" />
                              <span className="text-gray-700">
                                Enrolled: {new Date(activeTeam.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleInviteToTeam(activeTeam._id)}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                        >
                          <UserPlus size={16} />
                          <span>Invite</span>
                        </button>
                        <button
                          onClick={() => handleViewCourse(activeTeam._id)}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Eye size={16} />
                          <span>View Course</span>
                        </button>
                        <button
                          onClick={() => handleScheduleMeeting(activeTeam)}
                          className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                          <Calendar size={16} />
                          <span>Schedule</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Team Members ({activeTeam.members.length + 1})
                    </h3>
                    
                    {/* Current User */}
                    <div className="mb-6 p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {userData?.imageUrl ? (
                            <img
                              src={userData.imageUrl}
                              alt={userData.name}
                              className="w-12 h-12 rounded-full border-2 border-cyan-500"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold">
                              {userData?.name?.charAt(0) || "U"}
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900">{userData?.name} (You)</h4>
                            <p className="text-sm text-gray-600">{userData?.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-full">
                                Team Member
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Online
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate("/student/profile")}
                          className="text-cyan-600 hover:text-cyan-800 text-sm font-medium"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>

                    {/* Other Team Members */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeTeam.members.map((member) => (
                        <div
                          key={member._id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-cyan-200 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {member.imageUrl ? (
                                <img
                                  src={member.imageUrl}
                                  alt={member.name}
                                  className="w-12 h-12 rounded-full"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  {member.name?.charAt(0) || "S"}
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold text-gray-900">{member.name}</h4>
                                <p className="text-sm text-gray-600">{member.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                    {member.role}
                                  </span>
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {member.progress}% Progress
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleSendMessage(member)}
                                className="p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg"
                                title="Send Message"
                              >
                                <MessageSquare size={18} />
                              </button>
                              <button
                                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                                title="Video Call"
                              >
                                <Video size={18} />
                              </button>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600">Course Progress</span>
                              <span className="font-medium">{member.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400"
                                style={{ width: `${member.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Course Resources */}
                  {activeTeam.resources.length > 0 && (
                    <div className="p-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Resources</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeTeam.resources.map((resource) => (
                          <div
                            key={resource.pdfId}
                            className="p-3 border border-gray-200 rounded-lg hover:border-cyan-200 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 rounded-lg">
                                  <FileText size={20} className="text-red-500" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{resource.pdfTitle}</h4>
                                  <p className="text-xs text-gray-500">{resource.pdfDescription}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDownloadResource(resource)}
                                className="text-cyan-600 hover:text-cyan-800"
                                title="Download"
                              >
                                <Download size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button
                        onClick={() => navigate(`/student/apps/chat?team=${activeTeam._id}`)}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:border-cyan-200 transition-colors text-center"
                      >
                        <MessageSquare size={24} className="mx-auto mb-2 text-cyan-600" />
                        <span className="text-sm font-medium">Team Chat</span>
                      </button>
                      <button
                        onClick={() => handleScheduleMeeting(activeTeam)}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:border-cyan-200 transition-colors text-center"
                      >
                        <Video size={24} className="mx-auto mb-2 text-purple-600" />
                        <span className="text-sm font-medium">Video Meeting</span>
                      </button>
                      <button
                        onClick={() => navigate(`/student/projects?team=${activeTeam._id}`)}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:border-cyan-200 transition-colors text-center"
                      >
                        <FolderKanban size={24} className="mx-auto mb-2 text-green-600" />
                        <span className="text-sm font-medium">Project Tasks</span>
                      </button>
                      <button
                        onClick={() => handleInviteToTeam(activeTeam._id)}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:border-cyan-200 transition-colors text-center"
                      >
                        <Share2 size={24} className="mx-auto mb-2 text-blue-600" />
                        <span className="text-sm font-medium">Share Team</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">{activeTeam.totalMembers}</div>
                      <div className="text-sm text-blue-600">Total Members</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {Math.round(activeTeam.members.reduce((acc, m) => acc + m.progress, 0) / activeTeam.members.length)}%
                      </div>
                      <div className="text-sm text-green-600">Avg. Progress</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-700">
                        {activeTeam.resources.length}
                      </div>
                      <div className="text-sm text-purple-600">Resources</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-700">{activeTeam.progress}%</div>
                      <div className="text-sm text-yellow-600">Course Progress</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default Teams;