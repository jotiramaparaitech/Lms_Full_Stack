import StudentLayout from "../../../components/student/StudentLayout";
import { useState, useEffect, useContext, useRef } from "react";
import { AppContext } from "../../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Users,
  Search,
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
  ArrowLeft,
  MessageCircle,
  Lock,
  FileText,
  Download,
  File,
  ExternalLink,
  Eye,
  Mic,
  Link as LinkIcon,
  Camera,
  Upload,
  Edit2,
  MoreHorizontal,
  AlertCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import moment from "moment";
import { io } from "socket.io-client";

const Teams = () => {
  const { userData, backendUrl, getToken } = useContext(AppContext);
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const scrollRef = useRef();
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const logoInputRef = useRef(null);
  const editLogoInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const filesTabFileInputRef = useRef(null);
  const filesTabImageInputRef = useRef(null);

  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [showTeamMenu, setShowTeamMenu] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [editedTeamName, setEditedTeamName] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [teamLogo, setTeamLogo] = useState(null);
  const [editedTeamLogo, setEditedTeamLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  // Message edit/delete states
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [openMessageMenu, setOpenMessageMenu] = useState(null);
  const [editingFile, setEditingFile] = useState(false);
  const [uploadingFilesTab, setUploadingFilesTab] = useState(false);
  
  // Track which messages are currently being edited
  const [updatingMessages, setUpdatingMessages] = useState({});

  // FIXED: Check if user can send messages (team leader OR admin)
  const canSendMessages = () => {
    if (!activeTeam || !userData) return false;
    
    // Team leader can always send messages
    if (activeTeam.isLeader) return true;
    
    // Check if user has admin role in this team
    const userMembership = activeTeam.members?.find(
      (m) => m.userId?._id === userData._id
    );
    
    return userMembership?.role === "admin";
  };

  // FIXED: Check if user can edit team
  const canEditTeam = () => {
    if (!activeTeam || !userData) return false;
    
    // Team leader can always edit
    if (activeTeam.isLeader) return true;
    
    // Check if user has admin role in this team
    const userMembership = activeTeam.members?.find(
      (m) => m.userId?._id === userData._id
    );
    
    return userMembership?.role === "admin";
  };

  // FIXED: Check if user can edit/delete a specific message
  const canEditDeleteMessage = (message) => {
    if (!activeTeam || !userData || !message) return false;
    
    // If message is already deleted, cannot edit/delete
    if (message.deleted) return false;
    
    // Message sender can edit/delete
    if (message.sender?._id === userData._id) return true;
    
    // Team leader can edit/delete any message
    if (activeTeam.isLeader) return true;
    
    // Check if user has admin role in this team
    const userMembership = activeTeam.members?.find(
      (m) => m.userId?._id === userData._id
    );
    
    return userMembership?.role === "admin";
  };

  // Handle scroll to detect if user scrolled up
  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        const scrollTop = messagesContainerRef.current.scrollTop;
        setIsScrolled(scrollTop > 100);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [activeTeam]);

  // Reset edit modal when team changes
  useEffect(() => {
    if (activeTeam && showEditTeamModal) {
      setEditedTeamName(activeTeam.name);
      setEditedTeamLogo(null);
      setLogoPreview(activeTeam.logo || null);
    }
  }, [activeTeam, showEditTeamModal]);

  // ================= SOCKET.IO UPDATES =================
  useEffect(() => {
    socketRef.current = io(backendUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current.on("receive-message", (msg) => {
      console.log("Received message via socket:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("receive-file", (file) => {
      setFiles((prev) => [...prev, file]);
    });

    // New socket events for edit/delete
    socketRef.current.on("message-updated", (updatedMessage) => {
      console.log("Message updated via socket:", updatedMessage);
      setUpdatingMessages(prev => ({ ...prev, [updatedMessage._id]: false }));
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id ? { ...updatedMessage, edited: true } : msg
        )
      );
    });

    socketRef.current.on("message-deleted", (deletedMsg) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === deletedMsg._id 
            ? { ...msg, deleted: true, content: "[This message was deleted]" }
            : msg
        )
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [backendUrl]);

  useEffect(() => {
    if (activeTeam && socketRef.current) {
      socketRef.current.emit("join-team", activeTeam._id);
    }
  }, [activeTeam]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ================= FILE UPLOAD =================
  const handleFileSelect = async (e, fileType = "file", isFilesTab = false) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }

    // Validate file types
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const allowedFileTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain"
    ];

    if (fileType === "image" && !allowedImageTypes.includes(file.type)) {
      toast.error("Please select a valid image (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (fileType === "file" && !allowedFileTypes.includes(file.type) && !allowedImageTypes.includes(file.type)) {
      toast.error("Please select a valid file (PDF, Word, Excel, Text, or Images)");
      return;
    }

    await uploadFile(file, fileType, isFilesTab);
    
    // Reset input
    if (isFilesTab) {
      if (fileType === "image" && filesTabImageInputRef.current) filesTabImageInputRef.current.value = "";
      if (fileType === "file" && filesTabFileInputRef.current) filesTabFileInputRef.current.value = "";
    } else {
      if (fileType === "image" && imageInputRef.current) imageInputRef.current.value = "";
      if (fileType === "file" && fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const uploadFile = async (file, fileType = "file", isFilesTab = false) => {
    if (!activeTeam) return;
    
    // FIXED: Check if user can send messages
    if (!canSendMessages()) {
      toast.error("Only team leaders or admins can upload files");
      return;
    }
    
    if (isFilesTab) {
      setUploadingFilesTab(true);
    } else {
      setUploadingFile(true);
    }
    
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("teamId", activeTeam._id);

      const { data } = await axios.post(
        `${backendUrl}/api/teams/message/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("File uploaded successfully!");
        fetchMessages(activeTeam._id);
        if (activeTab === "files") {
          fetchTeamFiles(activeTeam._id);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload file");
    } finally {
      if (isFilesTab) {
        setUploadingFilesTab(false);
      } else {
        setUploadingFile(false);
      }
    }
  };

  // Edit file message
  const editFileMessage = async (file, messageId) => {
    if (!activeTeam || !messageId) return;
    
    // FIXED: Check if user can edit messages
    const targetMessage = messages.find(m => m._id === messageId);
    if (!targetMessage) return;
    
    if (!canEditDeleteMessage(targetMessage)) {
      toast.error("You don't have permission to edit this message");
      return;
    }
    
    setEditingFile(true);
    setUpdatingMessages(prev => ({ ...prev, [messageId]: true }));
    
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("messageId", messageId);
      formData.append("file", file);
      formData.append("teamId", activeTeam._id);

      const { data } = await axios.put(
        `${backendUrl}/api/teams/message/edit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("File updated successfully!");
        fetchMessages(activeTeam._id);
        if (activeTab === "files") {
          fetchTeamFiles(activeTeam._id);
        }
        
        // Emit socket event for real-time update
        if (socketRef.current) {
          socketRef.current.emit("message-updated", {
            ...targetMessage,
            attachmentUrl: data.updatedMessage?.attachmentUrl || targetMessage.attachmentUrl,
            content: data.updatedMessage?.content || targetMessage.content,
            updatedAt: new Date().toISOString(),
            edited: true
          });
        }
      }
    } catch (error) {
      console.error("Edit file error:", error);
      toast.error(error.response?.data?.message || "Failed to update file");
    } finally {
      setEditingFile(false);
      setEditingMessageId(null);
      setUpdatingMessages(prev => ({ ...prev, [messageId]: false }));
      if (editFileInputRef.current) editFileInputRef.current.value = "";
    }
  };

  const fetchTeamFiles = async (teamId) => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/teams/files/${teamId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        console.log("Files data:", data.files);
        setFiles(data.files);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  };

  const getFileUrl = (message) => {
    if (!message || message.deleted) return null;
    
    if (message.attachmentUrl && message.attachmentUrl.startsWith('http')) {
      return message.attachmentUrl;
    }
    
    if (message.type === 'text' && message.content) {
      return null;
    }
    
    return null;
  };

  const getFileName = (message) => {
    if (!message) return "File";
    
    if (message.deleted) return "[Deleted file]";
    
    if (message.content && message.type !== 'text') {
      return message.content;
    }
    
    if (message.attachmentUrl) {
      const urlParts = message.attachmentUrl.split('/');
      return urlParts[urlParts.length - 1];
    }
    
    return "file";
  };

  const downloadFile = async (url, fileName) => {
    if (!url) {
      toast.error("File not available for download");
      return;
    }
    
    try {
      // Show loading toast
      const downloadToast = toast.loading("Preparing download...");
      
      // Extract file name from URL if not provided
      let finalFileName = fileName || 'download';
      
      // Get file extension from URL
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const queryIndex = lastPart.indexOf('?');
      const cleanFileName = queryIndex > -1 ? lastPart.substring(0, queryIndex) : lastPart;
      
      // If fileName is generic or not provided, use the one from URL
      if (!fileName || fileName === 'file' || fileName === 'download') {
        finalFileName = cleanFileName;
      }
      
      // Ensure file has proper extension
      if (!finalFileName.includes('.')) {
        const extension = cleanFileName.includes('.') 
          ? cleanFileName.split('.').pop().split('?')[0]
          : getExtensionFromUrl(url);
        
        if (extension && extension.length <= 5) {
          finalFileName = `${finalFileName}.${extension}`;
        } else {
          // Try to detect file type from URL
          if (url.includes('image') || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url)) {
            finalFileName = `${finalFileName}.jpg`;
          } else if (url.includes('pdf') || /\.pdf(\?|$)/i.test(url)) {
            finalFileName = `${finalFileName}.pdf`;
          } else if (url.includes('doc') || /\.(doc|docx)(\?|$)/i.test(url)) {
            finalFileName = `${finalFileName}.docx`;
          } else if (url.includes('xls') || /\.(xls|xlsx)(\?|$)/i.test(url)) {
            finalFileName = `${finalFileName}.xlsx`;
          } else {
            finalFileName = `${finalFileName}.file`;
          }
        }
      }
      
      // Method 1: Try direct download with fetch (works for most servers)
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Fetch failed');
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = finalFileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
          document.body.removeChild(link);
        }, 100);
        
        toast.update(downloadToast, {
          render: "Download started!",
          type: "success",
          isLoading: false,
          autoClose: 2000
        });
        return;
        
      } catch (fetchError) {
        console.log("Fetch method failed, trying alternative...");
        
        // Method 2: Force download by adding download attribute
        const link = document.createElement('a');
        link.href = url;
        link.download = finalFileName;
        
        // Add these attributes to force download
        link.setAttribute('type', 'hidden');
        link.setAttribute('download', finalFileName);
        
        document.body.appendChild(link);
        
        // Try multiple click methods
        link.click();
        
        // Also try simulating a click with mouse events
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        link.dispatchEvent(event);
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
        
        toast.update(downloadToast, {
          render: "Download started!",
          type: "success",
          isLoading: false,
          autoClose: 2000
        });
      }
      
    } catch (error) {
      console.error("Download error:", error);
      
      // Fallback: Open in new tab with a message
      toast.warning("Opening file in new tab... Right-click and 'Save As' to download.");
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Helper function to get file extension from URL
  const getExtensionFromUrl = (url) => {
    try {
      // Remove query parameters
      const cleanUrl = url.split('?')[0];
      const parts = cleanUrl.split('.');
      if (parts.length > 1) {
        const ext = parts.pop().toLowerCase();
        // Common file extensions
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 
                                'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar'];
        if (validExtensions.includes(ext)) {
          return ext;
        }
      }
    } catch (e) {
      console.error("Error extracting extension:", e);
    }
    return null;
  };

  const viewFile = (url) => {
    if (!url) {
      toast.error("File not available");
      return;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ================= DATA FETCHING =================
  const fetchTeams = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/teams/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setTeams(data.teams);
        if (activeTeam) {
          const updated = data.teams.find(t => t._id === activeTeam._id);
          if (updated) {
            setActiveTeam(updated);
            setLogoPreview(updated.logo || null);
          }
        }
      }
    } catch (error) {
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (teamId) => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/teams/messages/${teamId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        console.log("Fetched messages:", data.messages);
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    if (userData) fetchTeams();
  }, [userData]);

  useEffect(() => {
    if (activeTeam && activeTeam.isMember) {
      fetchMessages(activeTeam._id);
      if (activeTab === "files") {
        fetchTeamFiles(activeTeam._id);
      }
    }
  }, [activeTeam]);

  useEffect(() => {
    if (activeTeam && activeTab === "files") {
      fetchTeamFiles(activeTeam._id);
    }
  }, [activeTab, activeTeam]);

  // ================= MESSAGE EDIT/DELETE FUNCTIONS =================
  const handleEditMessage = async () => {
    if (!editedContent.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    setUpdatingMessages(prev => ({ ...prev, [editingMessageId]: true }));

    try {
      const token = await getToken();
      const { data } = await axios.put(
        `${backendUrl}/api/teams/message/edit`,
        { 
          messageId: editingMessageId, 
          content: editedContent,
          teamId: activeTeam._id 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Message updated");
        setEditingMessageId(null);
        setEditedContent("");
        
        // Update local state immediately
        setMessages(prev => 
          prev.map(msg => 
            msg._id === editingMessageId 
              ? { ...msg, content: editedContent, edited: true, updatedAt: new Date().toISOString() }
              : msg
          )
        );
        
        // Emit socket event for real-time update
        if (socketRef.current) {
          socketRef.current.emit("message-updated", {
            _id: editingMessageId,
            content: editedContent,
            edited: true,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error("Edit message error:", error);
      toast.error(error.response?.data?.message || "Failed to edit message");
    } finally {
      setUpdatingMessages(prev => ({ ...prev, [editingMessageId]: false }));
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      const token = await getToken();
      
      const { data } = await axios.delete(
        `${backendUrl}/api/teams/message/delete/${messageId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (data.success) {
        toast.success("Message deleted");
        setOpenMessageMenu(null);
        
        // Also update local state immediately for better UX
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId 
              ? { ...msg, deleted: true, content: "[This message was deleted]" }
              : msg
          )
        );
        
        // Emit socket event for real-time update
        if (socketRef.current) {
          socketRef.current.emit("message-deleted", { _id: messageId });
        }
      }
    } catch (error) {
      console.error("Delete message error:", error);
      
      // More detailed error message
      if (error.response?.status === 403) {
        toast.error("You can only delete your own messages");
      } else if (error.response?.status === 404) {
        toast.error("Message not found");
      } else {
        toast.error(error.response?.data?.message || "Failed to delete message");
      }
    }
  };

  // Handle file edit selection
  const handleEditFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }

    // Validate file types
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const allowedFileTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain"
    ];

    if (!allowedImageTypes.includes(file.type) && !allowedFileTypes.includes(file.type)) {
      toast.error("Please select a valid file (PDF, Word, Excel, Text, or Images)");
      return;
    }

    await editFileMessage(file, editingMessageId);
  };

  // ================= TEAM ACTIONS =================
  const handleCreateTeam = async (e) => {
    e.preventDefault();

    if (!newTeamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    try {
      const token = await getToken();
      const formData = new FormData();

      formData.append("name", newTeamName);       
      formData.append("description", newTeamDesc);

      if (teamLogo) {
        formData.append("logo", teamLogo);         
      }

      const { data } = await axios.post(
        `${backendUrl}/api/teams/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (data.success) {
        toast.success("Team created successfully");
        setShowCreateModal(false);
        setNewTeamName("");
        setNewTeamDesc("");
        setTeamLogo(null);
        fetchTeams();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create team");
    }
  };

  const handleUpdateTeam = async () => {
    if (!editedTeamName.trim() && !editedTeamLogo) {
      toast.error("Nothing to update");
      return;
    }

    try {
      const token = await getToken();
      const formData = new FormData();

      formData.append("teamId", activeTeam._id);

      if (editedTeamName.trim()) {
        formData.append("name", editedTeamName);
      }

      if (editedTeamLogo) {
        formData.append("logo", editedTeamLogo);
      }

      const { data } = await axios.put(
        `${backendUrl}/api/teams/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (data.success) {
        toast.success("Team updated successfully");
        setShowEditTeamModal(false);
        setShowTeamMenu(false);
        setEditedTeamLogo(null);
        setEditedTeamName("");
        fetchTeams();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleLogoSelect = (e, isEditModal = false) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image (JPEG, PNG, GIF, WebP, SVG)');
      return;
    }

    // Validate file size (max 5MB for logos)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo size should be less than 5MB');
      return;
    }

    if (isEditModal) {
      setEditedTeamLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setTeamLogo(file);
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
      toast.error("Failed to send request");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !canSendMessages()) return;

    try {
      const token = await getToken();
      await axios.post(
        `${backendUrl}/api/teams/message/send`,
        { teamId: activeTeam._id, content: messageInput, type: "text" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessageInput("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const postMeetingLink = async (type) => {
    if (!canSendMessages()) {
      toast.error("Only team leaders or admins can post meeting links");
      return;
    }
    
    const link = prompt(`Enter ${type} Meeting URL:`);
    if (!link) return;

    try {
      const token = await getToken();
      await axios.post(
        `${backendUrl}/api/teams/message/send`,
        {
          teamId: activeTeam._id,
          content: `Started a ${type} meeting`,
          type: "call_link",
          linkData: { title: `${type} Meeting`, url: link }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Meeting link posted!");
    } catch (error) {
      toast.error("Failed to post meeting");
    }
  };

  const handleMemberAction = async (studentId, action) => {
    try {
      const token = await getToken();
      const endpoint = action === "remove" ? "remove-member" : "manage-request";
      const payload =
        action === "remove"
          ? { teamId: activeTeam._id, memberId: studentId }
          : { teamId: activeTeam._id, studentId, action };

      const { data } = await axios.post(
        `${backendUrl}/api/teams/${endpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Success");
        fetchTeams();
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm("Are you sure you want to delete this team? This action is irreversible.")) {
      return;
    }

    try {
      const token = await getToken();
      const { data } = await axios.delete(
        `${backendUrl}/api/teams/delete/${activeTeam._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success("Team deleted successfully");
        setActiveTeam(null);
        setShowTeamMenu(false);
        fetchTeams();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete team");
    }
  };

  useEffect(() => {
    setShowTeamMenu(false);
  }, [activeTeam]);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date like WhatsApp
  const formatWhatsAppDate = (date) => {
    const now = moment();
    const messageDate = moment(date);
    const diffDays = now.diff(messageDate, 'days');
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return messageDate.format('dddd'); // Monday, Tuesday, etc.
    } else {
      return messageDate.format('DD/MM/YYYY'); // 15/02/2024
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const grouped = {};
    
    messages.forEach((message) => {
      const dateKey = moment(message.createdAt).format('YYYY-MM-DD');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(message);
    });
    
    return grouped;
  };

  // FIXED: Get user role in team
  const getUserRoleInTeam = () => {
    if (!activeTeam || !userData) return null;
    
    if (activeTeam.isLeader) return "leader";
    
    const userMembership = activeTeam.members?.find(
      (m) => m.userId?._id === userData._id
    );
    
    return userMembership?.role || null;
  };

  // ================= RENDER MESSAGE ITEM =================
  const renderMessageItem = (msg) => {
    const fileUrl = getFileUrl(msg);
    const fileName = getFileName(msg);
    const canEditDelete = canEditDeleteMessage(msg);
    const isEditing = editingMessageId === msg._id;
    const isUpdating = updatingMessages[msg._id];
    const displayTime = msg.updatedAt && msg.edited ? msg.updatedAt : msg.createdAt;

    return (
      <div key={msg._id} className="flex gap-3 group">
        <div className="flex-shrink-0">
          <img 
            src={msg.sender?.imageUrl || "/default-avatar.png"} 
            alt={msg.sender?.name}
            className="w-9 h-9 rounded-full object-cover shadow-sm bg-white border border-gray-200" 
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">{msg.sender?.name}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">
                  {isUpdating ? (
                    <div className="flex items-center gap-1 text-gray-400">
                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500"></div>
                      <span className="text-xs">Updating...</span>
                    </div>
                  ) : (
                    moment(displayTime).format("h:mm A")
                  )}
                </span>
                {msg.edited && !msg.deleted && (
                  <span className="text-xs text-gray-400 italic">(edited)</span>
                )}
                {msg.deleted && (
                  <span className="text-xs text-gray-400 italic">(deleted)</span>
                )}
              </div>
            </div>
            
            {/* Message Actions Menu (Three Dots) */}
            {canEditDelete && !msg.deleted && (
              <div className="relative">
                <button
                  onClick={() => setOpenMessageMenu(openMessageMenu === msg._id ? null : msg._id)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                  ) : (
                    <MoreVertical size={16} />
                  )}
                </button>
                
                {openMessageMenu === msg._id && !isUpdating && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                    <button
                      onClick={() => {
                        if (msg.type === "text") {
                          setEditingMessageId(msg._id);
                          setEditedContent(msg.content);
                          setOpenMessageMenu(null);
                        } else if (msg.type === "image" || msg.type === "file") {
                          editFileInputRef.current.click();
                          setEditingMessageId(msg._id);
                          setOpenMessageMenu(null);
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                      disabled={editingFile}
                    >
                      {editingFile && msg._id === editingMessageId ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500"></div>
                      ) : (
                        <Edit2 size={14} />
                      )}
                      {editingFile && msg._id === editingMessageId ? "Uploading..." : "Edit"}
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      disabled={isUpdating}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Edit Message Input (for text messages) */}
          {isEditing && msg.type === "text" ? (
            <div className="mt-2">
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={3}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setEditingMessageId(null);
                    setEditedContent("");
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditMessage}
                  disabled={!editedContent.trim() || isUpdating}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                    editedContent.trim() && !isUpdating
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Regular Message Content */
            <>
              {msg.type === 'text' && (
                <p className="text-gray-800 text-sm mt-1 leading-relaxed bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm border border-gray-100 break-words">
                  {msg.deleted ? "[This message was deleted]" : msg.content}
                </p>
              )}

              {/* File/Image Messages */}
              {(msg.type === 'image' || msg.type === 'file') && (
                <div className="mt-2 max-w-md">
                  <div className={`border rounded-lg p-3 shadow-sm relative ${
                    msg.deleted 
                      ? "bg-gray-50 border-gray-200" 
                      : "bg-white border-gray-200"
                  }`}>
                    {isUpdating && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                          <span className="text-sm font-medium text-gray-700">Updating file...</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {msg.type === 'image' ? (
                          <ImageIcon size={14} className={msg.deleted ? "text-gray-400" : "text-green-500"} />
                        ) : (
                          <FileText size={14} className={msg.deleted ? "text-gray-400" : "text-blue-500"} />
                        )}
                        <span className={`text-xs font-medium ${
                          msg.deleted ? "text-gray-500" : "text-gray-700"
                        }`}>
                          {msg.deleted ? 'Deleted File' : (msg.type === 'image' ? 'Image' : 'File')}
                        </span>
                        {msg.edited && !msg.deleted && (
                          <span className="text-xs text-gray-400 italic">(edited)</span>
                        )}
                      </div>
                      
                      {/* Show download/view buttons only if file is not deleted */}
                      {!msg.deleted && fileUrl && !isUpdating && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => viewFile(fileUrl)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            title={msg.type === 'image' ? "View Image" : "View File"}
                          >
                            <Eye size={10} />
                            View
                          </button>
                          <button
                            onClick={() => downloadFile(fileUrl, fileName)}
                            className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
                            title="Download"
                          >
                            <Download size={10} />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {msg.deleted ? (
                      <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <AlertCircle size={24} className="text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">This file has been deleted</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {msg.type === 'image' && fileUrl ? (
                          <div className="relative">
                            <img 
                              src={fileUrl} 
                              alt={fileName || "Shared image"}
                              className="w-full rounded-lg max-h-48 object-contain bg-gray-50"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/400x300/e2e8f0/64748b?text=Image+Not+Found";
                              }}
                            />
                          </div>
                        ) : !msg.type === 'image' && fileUrl ? (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText size={18} className="text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 text-sm truncate">
                                {fileName}
                              </div>
                              <div className="text-xs text-gray-500">
                                Click to download
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Meeting Link Messages */}
              {msg.type === 'call_link' && !msg.deleted && (
                <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-3 max-w-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      {msg.linkData?.title?.includes('Voice') ? <Mic size={18} /> : <Video size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{msg.linkData?.title || "Meeting"}</h4>
                      <p className="text-xs text-gray-500 truncate">Call started by team leader/admin</p>
                    </div>
                  </div>
                  <a 
                    href={msg.linkData?.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors text-xs md:text-sm"
                  >
                    Join Meeting
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // ================= RENDER =================
  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Teams...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="flex h-[calc(100vh-80px)] bg-gray-50 font-sans">
        
        {/* SIDEBAR: TEAM LIST */}
        <div className={`${activeTeam ? "hidden md:flex" : "flex w-full"} md:w-80 bg-white border-r border-gray-200 flex-col`}>
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
                <input 
                  placeholder="Search or Join..." 
                  className="w-full bg-gray-100 pl-9 pr-3 py-2 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500" 
                />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {teams.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                No teams found. Join or create one!
              </div>
            )}
            {teams.map((team) => (
              <div
                key={team._id}
                onClick={() => setActiveTeam(team)}
                className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                  activeTeam?._id === team._id ? "bg-blue-50 border-l-4 border-blue-600" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {team.logo ? (
                    <img
                      src={team.logo}
                      alt={team.name}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
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
        <div className={`${activeTeam ? "flex w-full" : "hidden md:flex"} flex-1 flex-col bg-white`}>
          {activeTeam ? (
            <>
              {/* FIXED HEADER - Stays visible when scrolling */}
              <div className={`h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-6 bg-white sticky top-0 z-20 transition-all duration-200 ${
                isScrolled ? 'shadow-sm' : ''
              }`}>
                 <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setActiveTeam(null)} 
                      className="md:hidden text-gray-500 hover:text-gray-700 -ml-1"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    {activeTeam.logo ? (
                      <img
                        src={activeTeam.logo}
                        alt={activeTeam.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {activeTeam.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                        <h2 className="font-bold text-gray-800 text-sm md:text-base truncate max-w-[200px] md:max-w-[300px]">
                          {activeTeam.name}
                        </h2>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {/* FIXED: Show user role correctly */}
                          {getUserRoleInTeam() === "leader" && " • Team Leader"}
                          {getUserRoleInTeam() === "admin" && " • Admin"}
                        </p>
                    </div>
                 </div>
                 
                 {activeTeam.isMember && (
                    <div className="flex items-center gap-2">
                        <button 
                          onClick={() => postMeetingLink('Video')} 
                          className={`p-2 rounded-full transition-colors ${canSendMessages() ? 'text-gray-600 hover:bg-gray-100 hover:text-blue-600' : 'text-gray-300 cursor-not-allowed'}`} 
                          title={canSendMessages() ? "Start Video Call" : "Only team leaders/admins can start calls"}
                          disabled={!canSendMessages()}
                        >
                            <Video size={20} />
                        </button>
                        <button 
                          onClick={() => postMeetingLink('Voice')} 
                          className={`p-2 rounded-full transition-colors ${canSendMessages() ? 'text-gray-600 hover:bg-gray-100 hover:text-blue-600' : 'text-gray-300 cursor-not-allowed'}`} 
                          title={canSendMessages() ? "Start Voice Call" : "Only team leaders/admins can start calls"}
                          disabled={!canSendMessages()}
                        >
                            <Phone size={20} />
                        </button>
                        <div className="relative">
                           <button
                             onClick={() => setShowTeamMenu((prev) => !prev)}
                             className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                           >
                             <MoreVertical size={20} />
                           </button>
                           
                           {showTeamMenu && canEditTeam() && (
                              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                                <button
                                  onClick={() => {
                                    setShowTeamMenu(false);
                                    setEditedTeamName(activeTeam.name);
                                    setLogoPreview(activeTeam.logo || null);
                                    setShowEditTeamModal(true);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                                >
                                  <Camera size={16} />
                                  Edit Team
                                </button>
                                {activeTeam.isLeader && (
                                  <button
                                    onClick={() => {
                                      setShowTeamMenu(false);
                                      handleDeleteTeam();
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 size={16} />
                                    Delete Team
                                  </button>
                                )}
                              </div>
                           )}
                         </div>
                    </div>
                 )}
              </div>

              {/* TABS - Fixed position below header */}
              {activeTeam.isMember && (
                  <div className="sticky top-16 z-10 bg-white border-b border-gray-200 px-6 flex gap-6 text-sm">
                      <button 
                        onClick={() => setActiveTab('posts')} 
                        className={`py-3 font-medium border-b-2 transition-colors ${activeTab === 'posts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                      >
                        Posts
                      </button>
                      <button 
                        onClick={() => setActiveTab('files')} 
                        className={`py-3 font-medium border-b-2 transition-colors ${activeTab === 'files' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                      >
                        Files
                      </button>
                      <button 
                        onClick={() => setActiveTab('members')} 
                        className={`py-3 font-medium border-b-2 transition-colors ${activeTab === 'members' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                      >
                        Members ({activeTeam.members.length})
                      </button>
                  </div>
              )}

              {/* CONTENT AREA */}
              <div className="flex-1 overflow-hidden bg-gray-50/50 relative">
                  {/* NON-MEMBER VIEW */}
                  {!activeTeam.isMember && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                          <Users size={64} className="mb-4 text-gray-300" />
                          <p className="text-lg font-medium">You are not a member of this team.</p>
                          {activeTeam.isPending ? (
                              <p className="text-orange-500 mt-2">Join request pending approval.</p>
                          ) : (
                             <button 
                               onClick={() => handleJoinRequest(activeTeam._id)} 
                               className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                             >
                                 Request to Join
                             </button>
                          )}
                      </div>
                  )}

                  {/* POSTS TAB */}
                  {activeTeam.isMember && activeTab === 'posts' && (
                      <div className="flex flex-col h-full">
                          <div 
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto p-4 md:p-6"
                          >
                              {messages.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                  <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                                  <p className="text-lg font-medium">No messages yet</p>
                                  <p className="text-sm mt-2">
                                    {canSendMessages() 
                                      ? "Be the first to send a message!" 
                                      : "Only team leaders and admins can send messages"}
                                  </p>
                                </div>
                              ) : (
                                <>
                                  {Object.entries(groupMessagesByDate()).map(([dateKey, dateMessages]) => (
                                    <div key={dateKey} className="mb-6">
                                      {/* Date Separator */}
                                      <div className="flex items-center justify-center my-4">
                                        <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                                          {formatWhatsAppDate(dateMessages[0].createdAt)}
                                        </div>
                                      </div>
                                      
                                      {/* Messages for this date */}
                                      <div className="space-y-6">
                                        {dateMessages.map(renderMessageItem)}
                                      </div>
                                    </div>
                                  ))}
                                </>
                              )}
                              <div ref={scrollRef}></div>
                          </div>

                          {/* Hidden file inputs for Posts tab */}
                          <input
                            type="file"
                            ref={imageInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, "image", false)}
                          />
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,image/*"
                            onChange={(e) => handleFileSelect(e, "file", false)}
                          />
                          {/* Hidden edit file input */}
                          <input
                            ref={editFileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                            onChange={handleEditFileSelect}
                          />

                          {/* IMPROVED MESSAGE INPUT */}
                          {canSendMessages() ? (
                            <div className="p-4 bg-white border-t border-gray-200">
                                <form onSubmit={handleSendMessage} className="flex gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex gap-2">
                                        <button 
                                          type="button" 
                                          onClick={() => imageInputRef.current.click()}
                                          className="p-2 text-gray-400 hover:text-green-500 rounded-lg hover:bg-green-50 transition-colors border border-gray-200"
                                          disabled={uploadingFile}
                                          title="Upload Image"
                                        >
                                          {uploadingFile ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                                          ) : (
                                            <ImageIcon size={18} />
                                          )}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => fileInputRef.current.click()}
                                          className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
                                          disabled={uploadingFile}
                                          title="Upload File"
                                        >
                                          {uploadingFile ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                                          ) : (
                                            <Paperclip size={18} />
                                          )}
                                        </button>
                                    </div>
                                    
                                    <div className="flex-1 relative">
                                        <textarea 
                                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm min-h-[60px]"
                                          placeholder="Type a new message..."
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
                                        <button 
                                          type="submit" 
                                          disabled={!messageInput.trim() || uploadingFile}
                                          className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all flex items-center gap-1 ${
                                              messageInput.trim() && !uploadingFile
                                              ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md" 
                                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                          }`}
                                          title="Send Message"
                                        >
                                          {uploadingFile ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                          ) : (
                                            <Send size={18} />
                                          )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                          ) : (
                            <div className="p-4 bg-gray-50 border-t border-gray-200">
                              <div className="flex items-center justify-center gap-2 text-gray-500 p-3 bg-white rounded-xl border border-gray-200">
                                <Lock size={14} />
                                <p className="text-xs font-medium">
                                  Only team leaders can send messages in this team
                                </p>
                              </div>
                            </div>
                          )}
                      </div>
                  )}

                  {/* FILES TAB - FIXED VERSION */}
                  {activeTeam.isMember && activeTab === 'files' && (
                    <div className="h-full flex flex-col">
                      {/* Hidden file inputs for Files tab */}
                      <input
                        type="file"
                        ref={filesTabImageInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, "image", true)}
                      />
                      <input
                        type="file"
                        ref={filesTabFileInputRef}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,image/*"
                        onChange={(e) => handleFileSelect(e, "file", true)}
                      />
                      
                      {/* Hidden edit file input */}
                      <input
                        ref={editFileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleEditFileSelect}
                      />
                      
                      {/* UPLOAD SECTION (Same as Posts tab) */}
                      {canSendMessages() && (
                        <div className="p-4 bg-white border-b border-gray-200">
                          <div className="flex gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex gap-2">
                              <button 
                                type="button" 
                                onClick={() => filesTabImageInputRef.current.click()}
                                className="p-2 text-gray-400 hover:text-green-500 rounded-lg hover:bg-green-50 transition-colors border border-gray-200"
                                disabled={uploadingFilesTab}
                                title="Upload Image"
                              >
                                {uploadingFilesTab ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                                ) : (
                                  <ImageIcon size={18} />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => filesTabFileInputRef.current.click()}
                                className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
                                disabled={uploadingFilesTab}
                                title="Upload File"
                              >
                                {uploadingFilesTab ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                                ) : (
                                  <Paperclip size={18} />
                                )}
                              </button>
                            </div>
                            
                            <div className="flex-1 relative">
                              <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[60px] flex items-center">
                                <p className="text-sm text-gray-400">
                                  {uploadingFilesTab ? "Uploading file..." : "Click buttons to upload images or files"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* FILES LIST - FIXED EDITS */}
                      <div className="flex-1 overflow-y-auto p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                          <h3 className="text-lg font-bold text-gray-800">Team Files</h3>
                          <div className="text-sm text-gray-500">
                            {messages.filter(m => (m.type === 'image' || m.type === 'file') && !m.deleted).length} files
                          </div>
                        </div>
                        
                        {messages.filter(m => m.type === 'image' || m.type === 'file').length === 0 ? (
                          <div className="text-center py-12 text-gray-400">
                            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No files shared yet</p>
                            <p className="text-sm mt-2">
                              {canSendMessages() 
                                ? "Upload your first file using the upload buttons above" 
                                : "Only team leaders and admins can upload files"}
                            </p>
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            {messages
                              .filter(m => m.type === 'image' || m.type === 'file')
                              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by date, newest first
                              .map((file) => {
                                const fileUrl = getFileUrl(file);
                                const fileName = getFileName(file);
                                const fileExtension = fileName?.split('.').pop()?.toUpperCase() || 'FILE';
                                const canEditDelete = canEditDeleteMessage(file);
                                const isDeleted = file.deleted;
                                const isUpdating = updatingMessages[file._id];
                                const displayTime = file.updatedAt && file.edited ? file.updatedAt : file.createdAt;
                                
                                return (
                                  <div 
                                    key={file._id} 
                                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow relative ${
                                      isDeleted 
                                        ? "bg-gray-50 border-gray-200" 
                                        : "bg-white border-gray-200"
                                    }`}
                                  >
                                    {isUpdating && (
                                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                                        <div className="flex flex-col items-center gap-2">
                                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                          <span className="text-sm font-medium text-gray-700">Updating file...</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                          isDeleted 
                                            ? "bg-gray-100" 
                                            : file.type === 'image' 
                                              ? "bg-green-50" 
                                              : "bg-blue-50"
                                        }`}>
                                          {file.type === 'image' ? (
                                            <ImageIcon size={20} className={isDeleted ? "text-gray-400" : "text-green-500"} />
                                          ) : (
                                            <div className="text-center">
                                              <FileText size={18} className={isDeleted ? "text-gray-400" : "text-blue-500"} />
                                              {!isDeleted && (
                                                <span className="text-[8px] text-blue-600 font-bold block -mt-1">{fileExtension}</span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className={`font-medium truncate text-sm ${
                                            isDeleted ? "text-gray-500 italic" : "text-gray-800"
                                          }`} title={fileName}>
                                            {fileName}
                                          </div>
                                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                                            {isDeleted ? (
                                              <span className="text-red-500">Deleted</span>
                                            ) : (
                                              <>
                                                <span className="flex items-center gap-1">
                                                  {file.type === 'image' ? 'Image' : 
                                                  fileName?.endsWith('.pdf') ? 'PDF' :
                                                  fileName?.endsWith('.doc') || fileName?.endsWith('.docx') ? 'Word' :
                                                  fileName?.endsWith('.xls') || fileName?.endsWith('.xlsx') ? 'Excel' : 'File'}
                                                </span>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="truncate">Uploaded by {file.sender?.name}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <div className="flex items-center gap-1">
                                                  <span>{formatWhatsAppDate(displayTime)} at {moment(displayTime).format('h:mm A')}</span>
                                                  {file.edited && (
                                                    <span className="text-gray-400 italic">(edited)</span>
                                                  )}
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* ACTIONS COLUMN - FIXED */}
                                      <div className="flex items-center gap-2 ml-3">
                                        {/* Edit/Delete Menu (only if not deleted) */}
                                        {canEditDelete && !isDeleted && !isUpdating && (
                                          <div className="relative">
                                            <button
                                              onClick={() => setOpenMessageMenu(openMessageMenu === file._id ? null : file._id)}
                                              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded hover:bg-gray-100"
                                              title="More actions"
                                              disabled={isUpdating}
                                            >
                                              <MoreVertical size={16} />
                                            </button>
                                            
                                            {openMessageMenu === file._id && (
                                              <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                                                <button
                                                  onClick={() => {
                                                    editFileInputRef.current.click();
                                                    setEditingMessageId(file._id);
                                                    setOpenMessageMenu(null);
                                                  }}
                                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                                                  disabled={editingFile}
                                                >
                                                  <Edit2 size={14} />
                                                  Edit File
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteMessage(file._id)}
                                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                  <Trash2 size={14} />
                                                  Delete
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        
                                        {/* View Button (only if not deleted and has URL) */}
                                        {!isDeleted && fileUrl && !isUpdating && (
                                          <button
                                            onClick={() => viewFile(fileUrl)}
                                            className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded hover:bg-gray-100"
                                            title="View"
                                            disabled={isDeleted || isUpdating}
                                          >
                                            <Eye size={16} />
                                          </button>
                                        )}
                                        
                                        {/* Download Button (only if not deleted and has URL) */}
                                        {!isDeleted && fileUrl && !isUpdating && (
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              downloadFile(fileUrl, fileName);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded hover:bg-gray-100"
                                            title="Download"
                                            disabled={isDeleted || isUpdating}
                                          >
                                            <Download size={16} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Deleted File Message */}
                                    {isDeleted && (
                                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-center gap-2 text-gray-500">
                                          <AlertCircle size={14} />
                                          <p className="text-xs">This file has been deleted</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* MEMBERS TAB */}
                  {activeTeam.isMember && activeTab === 'members' && (
                      <div className="p-4 md:p-6 h-full overflow-y-auto">
                           {/* PENDING REQUESTS (Leader Only) */}
                           {activeTeam.isLeader && activeTeam.pendingRequests?.length > 0 && (
                               <div className="mb-6 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                                   <h3 className="font-bold text-orange-800 mb-3 text-sm flex items-center gap-2">
                                       <UserPlus size={14} /> Pending Requests
                                   </h3>
                                   <div className="space-y-2">
                                       {activeTeam.pendingRequests.map(user => (
                                           <div key={user._id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                                               <div className="flex items-center gap-3">
                                                    <img 
                                                      src={user.imageUrl || '/default-avatar.png'} 
                                                      alt={user.name}
                                                      className="w-8 h-8 rounded-full object-cover border border-gray-200" 
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
                                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                    </div>
                                               </div>
                                               <div className="flex gap-1">
                                                   <button 
                                                    onClick={() => handleMemberAction(user._id, 'accept')} 
                                                    className="p-1.5 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                                                    title="Accept"
                                                   >
                                                       <Check size={16}/>
                                                   </button>
                                                   <button 
                                                    onClick={() => handleMemberAction(user._id, 'reject')} 
                                                    className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                                    title="Reject"
                                                   >
                                                       <X size={16}/>
                                                   </button>
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
                                            <img 
                                              src={member.userId.imageUrl || '/default-avatar.png'} 
                                              alt={member.userId.name}
                                              className="w-9 h-9 rounded-full object-cover border border-gray-200" 
                                            />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-800 text-sm flex items-center gap-2 truncate">
                                                  {member.userId.name}
                                                  {member.userId._id === activeTeam.leaderId && (
                                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full flex-shrink-0">
                                                      Leader
                                                    </span>
                                                  )}
                                                  {member.role === 'admin' && member.userId._id !== activeTeam.leaderId && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">
                                                      Admin
                                                    </span>
                                                  )}
                                                </p>
                                                <p className="text-xs text-gray-500 capitalize truncate">
                                                  {member.role === 'admin' && member.userId._id !== activeTeam.leaderId 
                                                    ? 'Team Admin' 
                                                    : member.role}
                                                </p>
                                            </div>
                                       </div>
                                       {activeTeam.isLeader && member.userId._id !== userData._id && (
                                           <button 
                                             onClick={() => handleMemberAction(member.userId._id, 'remove')} 
                                             className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-gray-100"
                                             title="Remove Member"
                                           >
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-400 transition-colors group"
                      onClick={() => logoInputRef.current.click()}
                    >
                      {teamLogo ? (
                        <>
                          <img 
                            src={URL.createObjectURL(teamLogo)} 
                            alt="Logo preview" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={20} className="text-white" />
                          </div>
                        </>
                      ) : (
                        <Camera size={24} className="text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoSelect(e, false)}
                        className="hidden"
                      />
                      
                      <div>
                        <button
                          type="button"
                          onClick={() => logoInputRef.current.click()}
                          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          <Upload size={16} />
                          {teamLogo ? 'Change logo' : 'Upload logo'}
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, SVG up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setTeamLogo(null);
                  }}
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

      {/* EDIT TEAM MODAL - IMPROVED VERSION */}
      {showEditTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Team</h2>
              <button
                onClick={() => {
                  setShowEditTeamModal(false);
                  setEditedTeamLogo(null);
                  setLogoPreview(activeTeam.logo || null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Logo Section */}
              <div className="flex flex-col items-center">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Team Logo
                </label>
                
                <div className="relative mb-4">
                  {/* Logo Preview */}
                  <div 
                    className="w-32 h-32 rounded-full border-4 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer group"
                    onClick={() => editLogoInputRef.current.click()}
                  >
                    {logoPreview ? (
                      <>
                        <img 
                          src={typeof logoPreview === 'string' && logoPreview.startsWith('blob:') ? logoPreview : logoPreview} 
                          alt="Team logo preview" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-center text-white">
                            <Camera size={24} className="mx-auto mb-1" />
                            <span className="text-xs font-medium">Change Logo</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users size={32} className="text-gray-400" />
                        </div>
                        <p className="text-sm font-medium">Upload Logo</p>
                        <p className="text-xs mt-1">Click to select</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Remove Button (only when logo exists) */}
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogoPreview(null);
                        setEditedTeamLogo(null);
                      }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shadow-sm"
                      title="Remove logo"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                
                {/* Hidden File Input */}
                <input
                  ref={editLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoSelect(e, true)}
                  className="hidden"
                />
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  Recommended: 500×500px PNG, JPG, or SVG
                  <br />
                  Max size: 5MB
                </p>
              </div>

              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  value={editedTeamName}
                  onChange={(e) => setEditedTeamName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter team name"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditTeamModal(false);
                  setEditedTeamLogo(null);
                  setLogoPreview(activeTeam.logo || null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTeam}
                disabled={!editedTeamName.trim() && !editedTeamLogo}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  editedTeamName.trim() || editedTeamLogo
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default Teams;