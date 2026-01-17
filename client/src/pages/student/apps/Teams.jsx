import StudentLayout from "../../../components/student/StudentLayout";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  MessageSquare,
  Video,
  Calendar,
  FileText,
  UserPlus,
  BookOpen,
  Award,
  Clock,
  ChevronRight,
  Eye,
  Download,
  Share2,
  Settings,
  Loader2,
  User,
  Mail,
  CheckCircle,
  XCircle
} from "lucide-react";

const Teams = () => {
  const { 
    userData, 
    enrolledCourses = [], 
    fetchUserEnrolledCourses,
    backendUrl,
    getToken
  } = useContext(AppContext) || {};
  
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTeam, setActiveTeam] = useState(null);
  const navigate = useNavigate();

  // Function to fetch student details - FIXED APPROACH
  const fetchStudentDetails = async (studentId) => {
    try {
      const token = await getToken();
      // Use the correct endpoint format based on your backend
      const response = await fetch(`${backendUrl}/api/user/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error(`Error fetching student ${studentId}:`, error);
    }
    return null;
  };

  // Function to get student progress
  const fetchStudentProgress = async (studentId, courseId) => {
    try {
      const token = await getToken();
      const response = await fetch(`${backendUrl}/api/user/get-course-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          courseId: courseId,
          studentId: studentId 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Check if the response has progress data
        if (data.progressData) {
          // Get total lectures from the course
          const course = enrolledCourses.find(c => c._id === courseId);
          if (course && course.courseContent) {
            let totalLectures = 0;
            course.courseContent.forEach(chapter => {
              totalLectures += (chapter.chapterContent?.length || 0);
            });
            
            const completedLectures = data.progressData.lectureCompleted?.length || 0;
            return totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
          }
        }
        return data.progressPercent || 0;
      }
    } catch (error) {
      console.error(`Error fetching progress for ${studentId}:`, error);
    }
    return 0;
  };

  // Build teams from enrolled courses - SIMPLIFIED & CORRECTED
  useEffect(() => {
    const buildTeams = async () => {
      try {
        setLoading(true);
        console.log("Building teams from enrolled courses:", enrolledCourses);
        
        if (!enrolledCourses || enrolledCourses.length === 0) {
          console.log("No enrolled courses found");
          setTeams([]);
          setLoading(false);
          return;
        }

        const formattedTeams = [];
        
        // Create a team for EACH enrolled course
        for (const course of enrolledCourses) {
          console.log(`Processing course: ${course.courseTitle}`, course.enrolledStudents);
          
          // Check if course has enrolled students
          if (course.enrolledStudents && course.enrolledStudents.length > 0) {
            
            // Get ALL student IDs for this course
            const studentIds = course.enrolledStudents;
            console.log(`Course has ${studentIds.length} students:`, studentIds);
            
            // Create team members array
            const teamMembers = [];
            
            // Process each student in the course
            for (const studentId of studentIds) {
              try {
                // Get student details
                const studentDetails = await fetchStudentDetails(studentId);
                
                if (studentDetails) {
                  // Get progress for this student in this course
                  const progress = await fetchStudentProgress(studentId, course._id);
                  
                  const member = {
                    _id: studentId,
                    name: studentDetails.name || 'Unknown Student',
                    email: studentDetails.email || '',
                    imageUrl: studentDetails.imageUrl,
                    role: studentDetails.role || 'student',
                    isCurrentUser: studentId === userData?._id,
                    progress: progress
                  };
                  
                  teamMembers.push(member);
                  console.log(`Added student: ${member.name} (${studentId})`);
                } else {
                  // If student details not found, create placeholder
                  teamMembers.push({
                    _id: studentId,
                    name: 'Loading...',
                    email: '',
                    imageUrl: null,
                    role: 'student',
                    isCurrentUser: studentId === userData?._id,
                    progress: 0
                  });
                }
              } catch (error) {
                console.error(`Error processing student ${studentId}:`, error);
              }
            }
            
            // Only create team if we have members
            if (teamMembers.length > 0) {
              // Calculate average progress
              const avgProgress = teamMembers.length > 0
                ? Math.round(teamMembers.reduce((sum, member) => sum + member.progress, 0) / teamMembers.length)
                : 0;
              
              // Separate current user from others
              const currentUser = teamMembers.find(m => m.isCurrentUser);
              const otherMembers = teamMembers.filter(m => !m.isCurrentUser);
              
              const team = {
                _id: course._id,
                courseId: course._id,
                courseTitle: course.courseTitle || 'Untitled Project',
                courseDescription: course.courseDescription || 'No description',
                courseThumbnail: course.courseThumbnail,
                educator: course.educator || 'Unknown Educator',
                teamName: `${course.courseTitle || 'Project'} Team`,
                currentUser: currentUser,
                members: otherMembers,
                allMembers: teamMembers,
                totalMembers: teamMembers.length,
                projectStatus: "Active",
                resources: course.pdfResources || [],
                createdAt: course.createdAt || new Date(),
                avgProgress: avgProgress
              };
              
              console.log(`Created team: ${team.teamName} with ${team.totalMembers} members`);
              formattedTeams.push(team);
            }
          } else {
            console.log(`Course has no enrolledStudents array or it's empty`);
          }
        }
        
        console.log("Final teams:", formattedTeams);
        setTeams(formattedTeams);
        
        // Set first team as active if available
        if (formattedTeams.length > 0) {
          setActiveTeam(formattedTeams[0]);
        } else {
          console.log("No teams were created. Check enrolledCourses data structure.");
        }
        
      } catch (error) {
        console.error("Error building teams:", error);
      } finally {
        setLoading(false);
      }
    };

    // Initial load
    if (userData) {
      // If enrolledCourses is empty, fetch them first
      if (enrolledCourses.length === 0) {
        console.log("No enrolled courses in context, fetching...");
        fetchUserEnrolledCourses().then(() => {
          // Give a small delay for data to load
          setTimeout(() => {
            buildTeams();
          }, 1000);
        });
      } else {
        console.log("Building teams with existing enrolledCourses");
        buildTeams();
      }
    } else {
      console.log("No userData available");
      setLoading(false);
    }
  }, [userData, enrolledCourses]);

  // Debug function to log current state
  const debugState = () => {
    console.log("=== DEBUG INFO ===");
    console.log("User Data:", userData);
    console.log("Enrolled Courses:", enrolledCourses);
    console.log("Number of Courses:", enrolledCourses.length);
    
    if (enrolledCourses.length > 0) {
      enrolledCourses.forEach((course, index) => {
        console.log(`Course ${index + 1}: ${course.courseTitle}`);
        console.log(`  - ID: ${course._id}`);
        console.log(`  - Enrolled Students:`, course.enrolledStudents);
        console.log(`  - Number of Students:`, course.enrolledStudents?.length || 0);
      });
    }
    
    console.log("Teams:", teams);
    console.log("Active Team:", activeTeam);
    console.log("Loading:", loading);
    console.log("===================");
  };

  // Get progress color
  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-green-500 text-green-800';
    if (progress >= 70) return 'bg-blue-500 text-blue-800';
    if (progress >= 40) return 'bg-yellow-500 text-yellow-800';
    return 'bg-red-500 text-red-800';
  };

  // Get member initials
  const getMemberInitials = (name) => {
    if (!name || name === 'Loading...') return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Handle actions
  const handleSendMessage = (member) => {
    navigate(`/student/apps/chat?user=${member._id}&name=${encodeURIComponent(member.name)}`);
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Project Teams</h1>
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="h-12 w-12 text-cyan-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading project teams...</p>
            <p className="text-sm text-gray-500 mt-2">
              Processing {enrolledCourses.length} courses...
            </p>
            <button 
              onClick={debugState}
              className="mt-4 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Debug Info
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Project Teams</h1>
            <p className="text-gray-600 mt-1">
              {teams.length > 0 
                ? `Showing ${teams.reduce((sum, team) => sum + team.totalMembers, 0)} students across ${teams.length} projects`
                : "No project teams available"}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={debugState}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Debug
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search projects or students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Debug Info Button */}
        <div className="mb-4">
          <button 
            onClick={debugState}
            className="text-sm text-cyan-600 hover:text-cyan-800 underline"
          >
            Click here to see debug info in console
          </button>
        </div>

        {/* No Teams Found */}
        {teams.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <Users size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Project Teams Found</h3>
            <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Debug Information:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Enrolled Courses: {enrolledCourses.length}</li>
                <li>• User ID: {userData?._id || 'Not logged in'}</li>
                <li>• User Name: {userData?.name || 'Unknown'}</li>
              </ul>
            </div>
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
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">
                      My Projects ({teams.length})
                    </h3>
                    <span className="text-xs text-gray-500">
                      {teams.reduce((sum, team) => sum + team.totalMembers, 0)} students
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {teams.map((team) => (
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
                            {team.totalMembers} student{team.totalMembers !== 1 ? 's' : ''}
                          </p>
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <div className={`px-2 py-1 rounded-full text-xs ${getProgressColor(team.avgProgress)}`}>
                                {team.avgProgress}% avg
                              </div>
                              <span className="text-xs text-gray-500">
                                {team.members.length} other{team.members.length !== 1 ? 's' : ''}
                              </span>
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
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  {/* Team Header */}
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
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-900">
                            {activeTeam.teamName}
                          </h2>
                          <p className="text-gray-600 mt-1">{activeTeam.courseDescription}</p>
                          <div className="flex flex-wrap gap-4 mt-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Users size={16} className="text-gray-500" />
                              <span className="text-gray-700">{activeTeam.totalMembers} total students</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Award size={16} className="text-gray-500" />
                              <span className="text-gray-700">Educator: {activeTeam.educator}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          All Students in this Project ({activeTeam.totalMembers})
                        </h3>
                        <p className="text-sm text-gray-600">Including you and {activeTeam.members.length} others</p>
                      </div>
                    </div>
                    
                    {/* Current User Card */}
                    {activeTeam.currentUser && (
                      <div className="mb-6 p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {activeTeam.currentUser.imageUrl ? (
                              <img
                                src={activeTeam.currentUser.imageUrl}
                                alt={activeTeam.currentUser.name}
                                className="w-12 h-12 rounded-full border-2 border-cyan-500 object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {getMemberInitials(activeTeam.currentUser.name)}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">
                                  {activeTeam.currentUser.name} (You)
                                </h4>
                                <span className="px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-full">
                                  You
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{activeTeam.currentUser.email}</p>
                              <div className="mt-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${getProgressColor(activeTeam.currentUser.progress)}`}>
                                  Progress: {activeTeam.currentUser.progress}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Other Members Grid */}
                    {activeTeam.members.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeTeam.members.map((member) => (
                          <div
                            key={member._id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-cyan-200 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                {member.imageUrl ? (
                                  <img
                                    src={member.imageUrl}
                                    alt={member.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                    {getMemberInitials(member.name)}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-gray-900 truncate">{member.name}</h4>
                                  <p className="text-sm text-gray-600 truncate mt-1">{member.email}</p>
                                  <div className="mt-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${getProgressColor(member.progress)}`}>
                                      {member.progress}% complete
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleSendMessage(member)}
                                className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                title="Send Message"
                              >
                                <MessageSquare size={18} />
                              </button>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-gray-600">Course Progress</span>
                                <span className="font-semibold">{member.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getProgressColor(member.progress).split(' ')[0]}`}
                                  style={{ width: `${Math.min(member.progress, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No other students enrolled in this project yet.</p>
                      </div>
                    )}
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