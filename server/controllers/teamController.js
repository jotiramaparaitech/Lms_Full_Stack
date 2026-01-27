import Team from "../models/Team.js";
import TeamMessage from "../models/TeamMessage.js";
import User from "../models/User.js";

// -----------------------------
// Create Team
// -----------------------------
export const createTeam = async (req, res) => {
  try {
    const { name, description, banner } = req.body;
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

    const newTeam = await Team.create({
      name,
      description,
      banner,
      leader: userId,
      members: [{ userId, role: "admin" }],
      // ✅ Project domain could be stored here if we add schema validation,
      // but it's implicitly derived from the Leader's assignedProject for now.
    });

    res.json({
      success: true,
      team: newTeam,
      message: "Team created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Get All Teams
// -----------------------------
export const getTeams = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    const teams = await Team.find({
      $or: [{ "members.userId": userId }, { leader: userId }],
    })
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
// Send Message
// -----------------------------
export const sendMessage = async (req, res) => {
  try {
    const { teamId, content, type, attachmentUrl, linkData } = req.body;
    const auth = req.auth();
    const userId = auth?.userId;

    const team = await Team.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    const isMember = team.members.some((m) => m.userId === userId);
    if (!isMember)
      return res.status(403).json({ success: false, message: "Not a member" });

    const message = await TeamMessage.create({
      teamId,
      sender: userId,
      content,
      type,
      attachmentUrl,
      linkData,
    });

    await message.populate("sender", "name imageUrl");

    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
// Delete Team
// -----------------------------
export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const auth = req.auth();
    const userId = auth?.userId;

    const team = await Team.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    if (team.leader !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the Team Leader can delete the team",
      });
    }

    await TeamMessage.deleteMany({ teamId });
    await team.deleteOne();

    res.json({ success: true, message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
// Get Student Info (Leader Only)
// -----------------------------
export const getStudentInfo = async (req, res) => {
  try {
    const auth = req.auth();
    const leaderId = auth?.userId;

    if (!leaderId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Find team where this user is leader
    const team = await Team.findOne({ leader: leaderId });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "You are not a team leader or no team found",
      });
    }

    // Get all member IDs except leader
    const studentIds = team.members
      .filter((m) => m.userId !== leaderId)
      .map((m) => m.userId);

    // Fetch student user details + populate enrolledCourses
    const users = await User.find({ _id: { $in: studentIds } })
      .populate("enrolledCourses", "courseTitle")
      .lean();

    // ✅ Leader's Assigned Project
    const leaderUser = await User.findById(leaderId);
    const requiredProjectId = leaderUser?.assignedProject?.toString();

    // Convert user list into map for fast lookup
    const userMap = new Map();
    users.forEach((u) => userMap.set(u._id, u));

    // Format response for frontend
    const students = team.members
      .filter((m) => m.userId !== leaderId)
      .map((m) => {
        const user = userMap.get(m.userId);

        return {
          userId: m.userId,
          name: user?.name || "Unknown Student",
          email: user?.email || "",
          imageUrl: user?.imageUrl || "",
          role: m.role,
          progress: m.progress ?? 0,

          // ✅ AUTO PROJECT FETCH FROM ENROLLED COURSES
          projects: (user?.enrolledCourses || [])
            .filter(
              (c) =>
                !requiredProjectId || c._id.toString() === requiredProjectId,
            ) // ✅ Filter by domain
            .map((c) => c.courseTitle),
        };
      });

    return res.json({
      success: true,
      teamId: team._id,
      students,
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

    const { studentId, progress, projectName } = req.body;

    if (!leaderId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!studentId) {
      return res
        .status(400)
        .json({ success: false, message: "studentId is required" });
    }

    const team = await Team.findOne({ leader: leaderId });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found for this leader",
      });
    }

    const memberIndex = team.members.findIndex((m) => m.userId === studentId);

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your team",
      });
    }

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

    await team.save();

    return res.json({
      success: true,
      message: "Student progress updated successfully",
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

    const team = await Team.findOne({
      $or: [{ leader: userId }, { "members.userId": userId }],
    });

    if (!team) {
      return res.json({
        success: true,
        teamId: null,
        progress: 0,
        projectName: "",
        isLeader: false,
      });
    }

    const isLeader = team.leader === userId;
    const member = team.members.find((m) => m.userId === userId);

    return res.json({
      success: true,
      teamId: team._id,
      progress: member?.progress ?? 0,
      projectName: member?.projectName ?? "",
      isLeader,
    });
  } catch (error) {
    console.log("❌ getMyTeamProgress error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
