import Team from "../models/Team.js";
import TeamMessage from "../models/TeamMessage.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import moment from 'moment';
import { sendTeamAnnouncement } from "../utils/sendTeamEmail.js";
import Attendance from "../models/Attendance.js";

// -----------------------------
// Create Team
// -----------------------------
export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const auth = req.auth();
    const userId = auth?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user || !user.isTeamLeader) {
      return res.status(403).json({
        success: false,
        message: "Only Team Leaders can create teams",
      });
    }

    // 🔹 UPLOAD LOGO (if provided)
    let logoUrl = "";
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "team-logos",
          resource_type: "image",
        }
      );
      logoUrl = uploadResult.secure_url;
    }

    const newTeam = await Team.create({
      name,
      description,
      logo: logoUrl,
      leader: userId,
      members: [{ userId, role: "admin" }],
      channels: [{ name: "General", createdBy: userId }],
    });

    res.json({
      success: true,
      team: newTeam,
      message: "Team created successfully",
    });
  } catch (error) {
    console.error("❌ createTeam error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Update Team Details (Leader/Admin)
// -----------------------------
export const updateTeamDetails = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;
    const { teamId, name } = req.body;

    if (!teamId) {
      return res.status(400).json({ success: false, message: "teamId required" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    // ✅ Permission check
    const isLeader = team.leader === userId;
    const isAdmin = team.members.some(
      (m) => m.userId === userId && m.role === "admin"
    );

    if (!isLeader && !isAdmin) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    // ✅ Update name (optional)
    if (name && name.trim()) {
      team.name = name.trim();
    }

    // ✅ Update logo (optional)
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "team-logos",
          resource_type: "image"
        }
      );

      team.logo = uploadResult.secure_url;
      console.log("✅ Logo updated:", uploadResult.secure_url);
    }

    await team.save();

    return res.json({
      success: true,
      message: "Team updated successfully",
      team: {
        _id: team._id,
        name: team.name,
        logo: team.logo,
        description: team.description,
        leader: team.leader,
        members: team.members,
        banner: team.banner
      }
    });
  } catch (error) {
    console.error("❌ updateTeamDetails error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// 🔥 FIXED: Get ONLY teams where user is member/leader
// -----------------------------
export const getTeams = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Get user role for logging only - NOT for filtering
    let userRole = req.user?.role;
    if (!userRole) {
      const user = await User.findById(userId);
      userRole = user?.role || (user?.isTeamLeader ? 'educator' : 'student');
    }

    // 🔥 CRITICAL FIX: ALWAYS filter by user membership
    // No one sees teams they're not part of - including admins/educators
    const query = {
      $or: [
        { "members.userId": userId },  // User is a member
        { leader: userId }              // User is the leader
      ]
    };

    console.log(`👤 User ${userId} (${userRole}) - fetching ONLY their teams`);

    const teams = await Team.find(query)
      .populate("members.userId", "name imageUrl email")
      .populate("pendingRequests", "name imageUrl email")
      .sort({ updatedAt: -1 });

    const formattedTeams = teams.map((team) => {
      const isMember = team.members.some(
        (m) =>
          m.userId?._id?.toString() === userId ||
          m.userId?.toString() === userId,
      );
      const isLeader = team.leader === userId;
      const isPending = team.pendingRequests.some(
        (p) => p?._id?.toString() === userId || p?.toString() === userId,
      );

      return {
        ...team.toObject(),
        isMember,
        isLeader,
        isPending,
        memberCount: team.members.length,
      };
    });

    
    res.json({ success: true, teams: formattedTeams });
  } catch (error) {
    console.error("❌ getTeams error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Join Team Request
// -----------------------------
export const joinTeamRequest = async (req, res) => {
  try {
    const { teamId } = req.body;
    const auth = req.auth();
    const userId = auth?.userId;

    const team = await Team.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    if (team.members.some((m) => m.userId === userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Already a member" });
    }
    if (team.pendingRequests.includes(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Request already pending" });
    }

    team.pendingRequests.push(userId);
    await team.save();

    res.json({ success: true, message: "Join request sent" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Manage Join Request
// -----------------------------
export const manageRequest = async (req, res) => {
  try {
    const { teamId, studentId, action } = req.body;
    const auth = req.auth();
    const userId = auth?.userId;

    const team = await Team.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    const isAdmin =
      team.leader === userId ||
      team.members.some((m) => m.userId === userId && m.role === "admin");

    if (!isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Permission denied" });
    }

    if (action === "accept") {
      team.members.push({
        userId: studentId,
        role: "member",
        progress: 0,
        projectName: "",
      });
    }

    team.pendingRequests = team.pendingRequests.filter(
      (id) => id !== studentId,
    );
    await team.save();

    res.json({ success: true, message: `Request ${action}ed` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Send Message (Leader/Admin Only)
// -----------------------------
export const sendMessage = async (req, res) => {
  try {
    const { teamId, content, type, attachmentUrl, linkData } = req.body;
    const auth = req.auth();
    const userId = auth?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const team = await Team.findById(teamId).populate("members.userId", "email");
    
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    const member = team.members.find((m) => m.userId._id.toString() === userId);
    const isLeader = team.leader.toString() === userId;
    const isAdmin = member?.role === "admin";

    if (!isLeader && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only Team Leader or Admin can send messages",
      });
    }

    const message = await TeamMessage.create({
      teamId,
      sender: userId,
      content,
      type,
      attachmentUrl,
      linkData,
    });

    await message.populate("sender", "name imageUrl");

    req.app.get("io")?.to(teamId).emit("receive-message", message);

    if (isLeader) {
      const recipientEmails = team.members
        .filter(m => m.userId._id.toString() !== userId)
        .map(m => m.userId.email)
        .filter(email => email);

      sendTeamAnnouncement(
        recipientEmails,
        team.name,
        message.sender.name,
        content,
        attachmentUrl
      ).catch(err => console.error("Background email failed", err));
    }

    return res.json({
      success: true,
      message,
    });

  } catch (error) {
    console.error("❌ sendMessage error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// -----------------------------
// Get Messages
// -----------------------------
export const getMessages = async (req, res) => {
  try {
    const { teamId } = req.params;
    const auth = req.auth();
    const userId = auth?.userId;

    const team = await Team.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    const isMember = team.members.some((m) => m.userId === userId);
    if (!isMember)
      return res
        .status(403)
        .json({ success: false, message: "Join team to view messages" });

    const messages = await TeamMessage.find({ teamId })
      .sort({ createdAt: 1 })
      .populate("sender", "name imageUrl");

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Delete Team (Leader Only)
// -----------------------------
export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const auth = req.auth();
    const userId = auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    if (team.leader.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the Team Leader can delete this team",
      });
    }

    await TeamMessage.deleteMany({ teamId });
    await team.deleteOne();

    return res.json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("❌ deleteTeam error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// -----------------------------
// Remove Member
// -----------------------------
export const removeMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.body;
    const auth = req.auth();
    const userId = auth?.userId;

    const team = await Team.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    if (team.leader !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Permission denied" });
    }

    if (memberId === team.leader) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot remove team leader" });
    }

    team.members = team.members.filter((m) => m.userId !== memberId);
    await team.save();

    res.json({ success: true, message: "Member removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// -----------------------------
// Get Student Info (Leader Only) - WITH ATTENDANCE
// -----------------------------
export const getStudentInfo = async (req, res) => {
  try {
    const auth = req.auth();
    const leaderId = auth?.userId;

    if (!leaderId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 1. Fetch teams where the user is Leader or Admin
    const teams = await Team.find({
      $or: [
        { leader: leaderId },
        { members: { $elemMatch: { userId: leaderId, role: "admin" } } }
      ]
    });

    if (!teams || teams.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You are not a team leader/admin or no teams found",
      });
    }

    // 2. Collect unique student IDs from all these teams
    let allStudentIds = [];
    teams.forEach(team => {
      const ids = team.members
        .filter(m => m.userId !== leaderId)
        .map(m => m.userId);
      allStudentIds = [...allStudentIds, ...ids];
    });
    allStudentIds = [...new Set(allStudentIds)];

    // 3. FETCH ATTENDANCE DATA for all these students
    const attendanceRecords = await Attendance.find({
      studentId: { $in: allStudentIds }
    }).lean();

    // 4. CALCULATE ATTENDANCE DAYS
    // Logic: Group by student -> then group by date. 
    // 2 sessions on same date = 1.0 day, 1 session = 0.5 day.
    const attendanceSummaryMap = new Map();

    attendanceRecords.forEach(rec => {
      if (!attendanceSummaryMap.has(rec.studentId)) {
        attendanceSummaryMap.set(rec.studentId, {});
      }
      const studentDates = attendanceSummaryMap.get(rec.studentId);
      
      // Count sessions per unique date
      studentDates[rec.date] = (studentDates[rec.date] || 0) + 1;
    });

    const finalAttendanceCountMap = new Map();
    attendanceSummaryMap.forEach((dates, studentId) => {
      let totalDays = 0;
      Object.values(dates).forEach(sessionCount => {
        if (sessionCount >= 2) totalDays += 1; // Full Day
        else if (sessionCount === 1) totalDays += 0.5; // Half Day
      });
      finalAttendanceCountMap.set(studentId, totalDays);
    });

    // 5. Fetch User details and populated projects
    const users = await User.find({ _id: { $in: allStudentIds } })
      .populate("enrolledCourses", "courseTitle")
      .lean();

    const leaderUser = await User.findById(leaderId);
    const requiredProjectIds = leaderUser?.assignedProjects?.map(id => id.toString()) || [];

    const userMap = new Map();
    users.forEach((u) => userMap.set(u._id.toString(), u));

    const studentsMap = new Map();

    // 6. Build final student objects
    teams.forEach(team => {
      team.members
        .filter((m) => m.userId !== leaderId)
        .forEach((m) => {
          const userId = m.userId.toString();
          const user = userMap.get(userId);
          
          if (!studentsMap.has(userId)) {
            studentsMap.set(userId, {
              userId: userId,
              name: user?.name || "Unknown Student",
              email: user?.email || "",
              imageUrl: user?.imageUrl || "",
              role: m.role,
              progress: m.progress ?? 0,
              lorUnlocked: m.lorUnlocked ?? false,
              // Add the attendance score here
              attendanceDays: finalAttendanceCountMap.get(userId) || 0,
              projects: (user?.enrolledCourses || [])
                .filter(c => requiredProjectIds.length === 0 || requiredProjectIds.includes(c._id.toString()))
                .map(c => c.courseTitle),
              teams: []
            });
          }
          
          const studentData = studentsMap.get(userId);
          studentData.teams.push({
            teamId: team._id,
            teamName: team.name,
            progress: m.progress ?? 0,
            lorUnlocked: m.lorUnlocked ?? false
          });
          
          if ((m.progress ?? 0) > studentData.progress) {
            studentData.progress = m.progress ?? 0;
          }
          if (m.lorUnlocked) studentData.lorUnlocked = true;
        });
    });

    return res.json({
      success: true,
      teams: teams.map(t => ({ _id: t._id, name: t.name })),
      students: Array.from(studentsMap.values()),
    });

  } catch (error) {
    console.log("❌ getStudentInfo error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
// -----------------------------
// Update Student Progress (Leader Only)
// -----------------------------
export const updateStudentProgress = async (req, res) => {
  try {
    const auth = req.auth();
    const leaderId = auth?.userId;

    const { studentId, progress, projectName, lorUnlocked, teamId } = req.body;

    if (!leaderId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!studentId) {
      return res
        .status(400)
        .json({ success: false, message: "studentId is required" });
    }

    let query = {
      $or: [
        { leader: leaderId },
        { members: { $elemMatch: { userId: leaderId, role: "admin" } } }
      ]
    };
    
    if (teamId) {
      query._id = teamId;
    }

    const teams = await Team.find(query);

    if (!teams || teams.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No teams found for this leader",
      });
    }

    let updatedCount = 0;

    for (const team of teams) {
      const memberIndex = team.members.findIndex((m) => m.userId === studentId);

      if (memberIndex !== -1) {
        if (progress !== undefined) {
          const numProgress = Number(progress);
          if (Number.isNaN(numProgress) || numProgress < 0 || numProgress > 100) {
            return res.status(400).json({
              success: false,
              message: "Progress must be a number between 0 and 100",
            });
          }
          team.members[memberIndex].progress = numProgress;
        }

        if (projectName !== undefined) {
          team.members[memberIndex].projectName = projectName;
        }

        if (lorUnlocked !== undefined) {
          team.members[memberIndex].lorUnlocked = lorUnlocked;
        }

        await team.save();
        updatedCount++;
      }
    }

    if (updatedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found in any of your teams",
      });
    }

    return res.json({
      success: true,
      message: `Student progress updated in ${updatedCount} team(s)`,
    });
  } catch (error) {
    console.log("❌ updateStudentProgress error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Get My Team Progress
// -----------------------------
export const getMyTeamProgress = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const teams = await Team.find({
      "members.userId": userId
    });

    if (!teams || teams.length === 0) {
      return res.json({
        success: true,
        teams: [],
        overallProgress: 0,
        message: "No teams found"
      });
    }

    const teamProgressList = teams.map(team => {
      const member = team.members.find(m => m.userId === userId);
      return {
        teamId: team._id,
        teamName: team.name,
        progress: member?.progress ?? 0,
        projectName: member?.projectName ?? "",
        lorUnlocked: member?.lorUnlocked ?? false,
        role: member?.role ?? "member",
        isLeader: team.leader === userId
      };
    });

    const maxProgress = Math.max(...teamProgressList.map(t => t.progress), 0);

    return res.json({
      success: true,
      teams: teamProgressList,
      overallProgress: maxProgress,
      teamCount: teams.length,
      message: teamProgressList.length > 1 
        ? `You are in ${teamProgressList.length} teams. Showing your highest progress.` 
        : ""
    });
  } catch (error) {
    console.log("❌ getMyTeamProgress error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Update Team Name
// -----------------------------
export const updateTeamName = async (req, res) => {
  try {
    const { teamId, name } = req.body;
    const auth = req.auth();
    const userId = auth?.userId;

    if (!name || !teamId) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    const isLeader = team.leader === userId;
    const isAdmin = team.members.some(
      (m) => m.userId === userId && m.role === "admin"
    );

    if (!isLeader && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    team.name = name;
    await team.save();

    res.json({
      success: true,
      message: "Team name updated successfully",
      team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// -----------------------------
// Edit Message
// -----------------------------
export const editMessage = async (req, res) => {
  try {
    const { messageId, content } = req.body;
    const userId = req.auth()?.userId;

    const message = await TeamMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    if (message.type === "text") {
      message.content = content;
    }

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "team-messages",
          resource_type: "auto",
        }
      );

      message.attachmentUrl = uploadResult.secure_url;
      message.content = req.file.originalname;
    }

    message.edited = true;
    await message.save();

    await message.populate("sender", "name imageUrl");

    return res.json({ success: true, message });
  } catch (err) {
    console.error("❌ editMessage error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -----------------------------
// Delete Message
// -----------------------------
export const deleteMessageById = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.auth()?.userId;

    const message = await TeamMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    message.deleted = true;
    message.content = "This message was deleted";
    await message.save();

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -----------------------------
// Get Team Files
// -----------------------------
export const getTeamFiles = async (req, res) => {
  try {
    const { teamId } = req.params;
    const auth = req.auth();
    const userId = auth?.userId;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    const isMember = team.members.some((m) => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Join team to view files"
      });
    }

    const files = await TeamMessage.find({
      teamId,
      type: { $in: ['image', 'file'] },
      deleted: { $ne: true }
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name imageUrl")
      .lean();

    const enhancedFiles = files.map(file => {
      let fileType = 'file';
      let fileName = file.content || 'Unknown File';
      let fileSize = 'Unknown';

      if (file.attachmentUrl) {
        try {
          const url = new URL(file.attachmentUrl);
          const pathParts = url.pathname.split('/');
          fileName = pathParts[pathParts.length - 1] || fileName;
        } catch (e) {}
      }

      if (file.type === 'image') {
        fileType = 'image';
      } else if (file.attachmentUrl) {
        const url = file.attachmentUrl.toLowerCase();
        if (url.includes('.pdf') || url.includes('/pdf/') || url.includes('application/pdf')) {
          fileType = 'pdf';
        } else if (url.includes('.doc') || url.includes('.docx') || url.includes('application/msword') || url.includes('application/vnd.openxmlformats')) {
          fileType = 'document';
        } else if (url.includes('.xls') || url.includes('.xlsx') || url.includes('application/vnd.ms-excel')) {
          fileType = 'spreadsheet';
        } else if (url.includes('.txt') || url.includes('text/plain')) {
          fileType = 'text';
        } else if (url.includes('.zip') || url.includes('.rar') || url.includes('application/zip')) {
          fileType = 'archive';
        }
      }

      return {
        ...file,
        fileName,
        fileType,
        fileSize,
        downloadUrl: file.attachmentUrl,
        isPDF: fileType === 'pdf',
        isImage: fileType === 'image',
        uploadedAt: file.createdAt,
        formattedDate: moment(file.createdAt).format('DD MMM YYYY, h:mm A')
      };
    });

    res.json({
      success: true,
      files: enhancedFiles,
      count: enhancedFiles.length
    });
  } catch (error) {
    console.error("❌ getTeamFiles error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Get ALL Teams (Admin Dashboard ONLY)
// -----------------------------
export const getAllTeamsForAdmin = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Verify user is actually an admin
    const user = await User.findById(userId);
    if (user?.role !== 'admin' && user?.role !== 'educator') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const teams = await Team.find({})
      .select("_id name leader members createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      teams,
    });
  } catch (error) {
    console.error("❌ getAllTeamsForAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};