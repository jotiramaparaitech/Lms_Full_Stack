import StudentLayout from "../../../components/student/StudentLayout";
import { useState, useEffect, useContext, useRef } from "react";
import { AppContext } from "../../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Users,
  Search,
  MessageSquare,
  Video,
  Phone,
  Plus,
  Send,
  MoreVertical,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  UserPlus,
  Check,
  X,
  LogOut
} from "lucide-react";
import moment from "moment";

const Teams = () => {
  const { userData, backendUrl, getToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("posts"); // posts, members, requests
  
  // Create Team Form
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");

  const scrollRef = useRef();

  // -----------------------------
  // Data Fetching
  // -----------------------------
  const fetchTeams = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/teams/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setTeams(data.teams);
        // If active team exists, update it with fresh data
        if (activeTeam) {
          const updated = data.teams.find((t) => t._id === activeTeam._id);
          if (updated) setActiveTeam(updated);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (teamId) => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/teams/messages/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (userData) fetchTeams();
  }, [userData]);

  useEffect(() => {
    if (activeTeam && activeTeam.isMember) {
      fetchMessages(activeTeam._id);
    }
  }, [activeTeam]);

  // Scroll to bottom of chat
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -----------------------------
  // Actions
  // -----------------------------
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/teams/create`,
        { name: newTeamName, description: newTeamDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Team created!");
        setShowCreateModal(false);
        setNewTeamName("");
        setNewTeamDesc("");
        fetchTeams();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create team");
    }
  };

  const handleJoinRequest = async (teamId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/teams/join-request`,
        { teamId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Request sent!");
        fetchTeams();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/teams/message/send`,
        { teamId: activeTeam._id, content: messageInput, type: "text" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setMessages([...messages, data.message]);
        setMessageInput("");
      }
    } catch (error) {
      toast.error("Failed to send");
    }
  };

  const postMeetingLink = async (type) => {
    const link = prompt(`Enter ${type} Meeting URL (e.g., Zoom/Meet):`);
    if (!link) return;
    try {
        const token = await getToken();
        // Post a message with type 'call_link'
        const { data } = await axios.post(
          `${backendUrl}/api/teams/message/send`,
          { 
            teamId: activeTeam._id, 
            content: `Started a ${type} meeting`, 
            type: "call_link",
            linkData: { title: `${type} Meeting`, url: link }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) {
          setMessages([...messages, data.message]);
        }
      } catch (error) {
        toast.error("Failed to post meeting");
      }
  }

  const handleMemberAction = async (studentId, action) => {
      try {
        const token = await getToken();
        const endpoint = action === 'remove' ? 'remove-member' : 'manage-request';
        const payload = action === 'remove' 
            ? { teamId: activeTeam._id, memberId: studentId }
            : { teamId: activeTeam._id, studentId, action };

        const { data } = await axios.post(
            `${backendUrl}/api/teams/${endpoint}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if(data.success) {
            toast.success("Success");
            fetchTeams();
        }
      } catch (error) {
          toast.error(error.message);
      }
  }

  // -----------------------------
  // Render
  // -----------------------------
  if (loading) return <div className="p-10 text-center">Loading Teams...</div>;

  return (
    <StudentLayout>
      <div className="flex h-[calc(100vh-80px)] bg-gray-50 font-sans">
        
        {/* SIDEBAR: TEAM LIST */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="font-bold text-lg text-gray-800">Teams</h2>
            {userData?.isTeamLeader && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md transition-all"
                title="Create Team"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
          <div className="p-3">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input placeholder="Search or Join..." className="w-full bg-gray-100 pl-9 pr-3 py-2 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500" />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {teams.length === 0 && <div className="p-4 text-center text-gray-500 text-sm">No teams found. Join or create one!</div>}
            {teams.map((team) => (
              <div
                key={team._id}
                onClick={() => setActiveTeam(team)}
                className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                  activeTeam?._id === team._id ? "bg-blue-50 border-l-4 border-blue-600" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {team.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate text-sm">{team.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{team.members.length} members</p>
                  </div>
                  {!team.isMember && !team.isPending && (
                       <button 
                        onClick={(e) => { e.stopPropagation(); handleJoinRequest(team._id); }}
                        className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                        >
                           Join
                       </button>
                  )}
                  {team.isPending && <span className="text-xs text-orange-500">Pending</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col bg-white">
          {activeTeam ? (
            <>
              {/* HEADER */}
              <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shadow-sm z-10">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                         {activeTeam.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800">{activeTeam.name}</h2>
                        <p className="text-xs text-gray-500">{activeTeam.description || "Active Project Team"}</p>
                    </div>
                 </div>
                 
                 {activeTeam.isMember && (
                    <div className="flex items-center gap-3 text-gray-600">
                        <button onClick={() => postMeetingLink('Video')} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Start Video Call">
                            <Video size={20} />
                        </button>
                        <button onClick={() => postMeetingLink('Voice')} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Start Voice Call">
                            <Phone size={20} />
                        </button>
                        <div className="h-6 w-px bg-gray-300 mx-1"></div>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                 )}
              </div>

               {/* TABS (Only visible if member) */}
              {activeTeam.isMember && (
                  <div className="flex border-b border-gray-200 px-6 gap-6 text-sm">
                      <button onClick={() => setActiveTab('posts')} className={`py-3 font-medium border-b-2 transition-colors ${activeTab === 'posts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Posts</button>
                      <button onClick={() => setActiveTab('files')} className={`py-3 font-medium border-b-2 transition-colors ${activeTab === 'files' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Files</button>
                      <button onClick={() => setActiveTab('members')} className={`py-3 font-medium border-b-2 transition-colors ${activeTab === 'members' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Members ({activeTeam.members.length})</button>
                  </div>
              )}

              {/* CONTENT AREA */}
              <div className="flex-1 overflow-hidden relative bg-gray-50/50">
                  {/* NON-MEMBER VIEW */}
                  {!activeTeam.isMember && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                          <Users size={64} className="mb-4 text-gray-300" />
                          <p className="text-lg font-medium">You are not a member of this team.</p>
                          {activeTeam.isPending ? (
                              <p className="text-orange-500 mt-2">Join request pending approval.</p>
                          ) : (
                             <button onClick={() => handleJoinRequest(activeTeam._id)} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                 Request to Join
                             </button>
                          )}
                      </div>
                  )}

                  {/* POSTS TAB */}
                  {activeTeam.isMember && activeTab === 'posts' && (
                      <div className="flex flex-col h-full">
                          <div className="flex-1 overflow-y-auto p-6 space-y-6">
                              {messages.map((msg) => (
                                  <div key={msg._id} className="flex gap-4 group">
                                      <img src={msg.sender?.imageUrl || "/default-avatar.png"} className="w-10 h-10 rounded-full object-cover shadow-sm bg-white" />
                                      <div className="flex-1">
                                          <div className="flex items-baseline gap-2">
                                              <span className="font-bold text-gray-900 text-sm">{msg.sender?.name}</span>
                                              <span className="text-xs text-gray-400">{moment(msg.createdAt).format("h:mm A")}</span>
                                          </div>
                                          
                                          {msg.type === 'text' && (
                                              <p className="text-gray-800 text-sm mt-1 leading-relaxed bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm inline-block max-w-[80%] border border-gray-100">
                                                  {msg.content}
                                              </p>
                                          )}
                                          
                                          {msg.type === 'call_link' && (
                                              <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-4 max-w-md">
                                                  <div className="flex items-center gap-3 mb-2">
                                                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                                          <Video size={20} />
                                                      </div>
                                                      <div>
                                                          <h4 className="font-bold text-gray-900">{msg.linkData?.title || "Meeting"}</h4>
                                                          <p className="text-xs text-gray-500">Video call started</p>
                                                      </div>
                                                  </div>
                                                  <a href={msg.linkData?.url} target="_blank" rel="noreferrer" className="block w-full text-center bg-blue-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors">
                                                      Join Meeting
                                                  </a>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              ))}
                              <div ref={scrollRef}></div>
                          </div>

                          {/* INPUT DECK */}
                          <div className="p-4 bg-white border-t border-gray-200">
                              <form onSubmit={handleSendMessage} className="flex flex-col gap-2 relative">
                                  <textarea 
                                    className="w-full border border-gray-300 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm min-h-[50px]"
                                    placeholder="Type a new message"
                                    rows={2}
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                  />
                                  <div className="flex justify-between items-center px-1">
                                      <div className="flex gap-2 text-gray-400">
                                          <button type="button" className="hover:text-gray-600 p-1"><ImageIcon size={18} /></button>
                                          <button type="button" className="hover:text-gray-600 p-1"><Paperclip size={18} /></button>
                                      </div>
                                      <button type="submit" className="bg-transparent text-blue-600 hover:bg-blue-50 p-2 rounded-full absolute bottom-3 right-2">
                                          <Send size={20} />
                                      </button>
                                  </div>
                              </form>
                          </div>
                      </div>
                  )}

                  {/* MEMBERS TAB */}
                  {activeTeam.isMember && activeTab === 'members' && (
                      <div className="p-6 h-full overflow-y-auto">
                           {/* PENDING REQUESTS (Leader Only) */}
                           {activeTeam.isLeader && activeTeam.pendingRequests?.length > 0 && (
                               <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-lg">
                                   <h3 className="font-bold text-orange-800 mb-3 text-sm flex items-center gap-2">
                                       <UserPlus size={16} /> Pending Requests
                                   </h3>
                                   <div className="space-y-2">
                                       {activeTeam.pendingRequests.map(userId => (
                                           <div key={userId} className="flex justify-between items-center bg-white p-2 rounded border border-orange-100 shadow-sm">
                                               <span className="text-sm font-medium text-gray-700">User ID: {userId.substring(0,8)}...</span>
                                               <div className="flex gap-2">
                                                   <button onClick={() => handleMemberAction(userId, 'accept')} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check size={16}/></button>
                                                   <button onClick={() => handleMemberAction(userId, 'reject')} className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"><X size={16}/></button>
                                               </div>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                           )}

                           <h3 className="font-bold text-gray-800 mb-4">Team Members</h3>
                           <div className="space-y-2">
                               {activeTeam.members.map((member) => (
                                   <div key={member.userId._id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                                       <div className="flex items-center gap-3">
                                            <img src={member.userId.imageUrl || '/default-avatar.png'} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <p className="font-semibold text-gray-800 text-sm">{member.userId.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                                            </div>
                                       </div>
                                       {activeTeam.isLeader && member.userId._id !== userData._id && (
                                           <button onClick={() => handleMemberAction(member.userId._id, 'remove')} className="text-gray-400 hover:text-red-500 p-2">
                                               <Trash2 size={16} />
                                           </button>
                                       )}
                                   </div>
                               ))}
                           </div>
                      </div>
                  )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
               <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                   <Users size={64} className="text-gray-300" />
               </div>
               <h3 className="text-xl font-semibold text-gray-600">Select a Team</h3>
               <p className="text-sm mt-2 max-w-xs text-center">Choose a team from the sidebar to start collaborating or create a new one.</p>
            </div>
          )}
        </div>
      </div>

       {/* CREATE TEAM MODAL */}
       {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Create New Team</h2>
            <form onSubmit={handleCreateTeam}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. Web Dev Project Alpha"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                    value={newTeamDesc}
                    onChange={(e) => setNewTeamDesc(e.target.value)}
                    placeholder="What's this team about?"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default Teams;