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

    // Optional: Check if user is allowed to create teams (e.g., isTeamLeader)
    const user = await User.findById(userId);
    if (!user || !user.isTeamLeader) {
       return res.status(403).json({ success: false, message: "Only Team Leaders can create teams" });
    }

    const newTeam = await Team.create({
      name,
      description,
      banner,
      leader: userId,
      members: [{ userId, role: "admin" }], // Leader is first member and admin
    });

    res.json({ success: true, team: newTeam, message: "Team created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Get All Teams (Explore + My Teams)
// -----------------------------
export const getTeams = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    // Fetch all teams
    // In a production app, you might want pagination and filtering
    const teams = await Team.find()
      .populate("members.userId", "name imageUrl email") // Populate member details
      .populate("pendingRequests", "name imageUrl email") // Populate pending requests
      .sort({ updatedAt: -1 });

    const formattedTeams = teams.map((team) => {
      const isMember = team.members.some((m) => m.userId?._id === userId || m.userId === userId);
      const isLeader = team.leader === userId;
      const isPending = team.pendingRequests.includes(userId);

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
    if (!team) return res.status(404).json({ success: false, message: "Team not found" });

    if (team.members.some((m) => m.userId === userId)) {
      return res.status(400).json({ success: false, message: "Already a member" });
    }
    if (team.pendingRequests.includes(userId)) {
      return res.status(400).json({ success: false, message: "Request already pending" });
    }

    team.pendingRequests.push(userId);
    await team.save();

    res.json({ success: true, message: "Join request sent" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Manage Join Request (Accept/Reject)
// -----------------------------
export const manageRequest = async (req, res) => {
  try {
    const { teamId, studentId, action } = req.body; // action: 'accept' | 'reject'
    const auth = req.auth();
    const userId = auth?.userId;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: "Team not found" });

    // Verify requester is leader or admin
    const isAdmin = team.leader === userId || team.members.some(m => m.userId === userId && m.role === 'admin');
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    if (action === 'accept') {
      team.members.push({ userId: studentId, role: 'member' });
    }
    
    // Remove from pending in both cases
    team.pendingRequests = team.pendingRequests.filter(id => id !== studentId);
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
    if (!team) return res.status(404).json({ success: false, message: "Team not found" });

    const isMember = team.members.some((m) => m.userId === userId);
    if (!isMember) return res.status(403).json({ success: false, message: "Not a member" });

    const message = await TeamMessage.create({
      teamId,
      sender: userId,
      content,
      type,
      attachmentUrl,
      linkData
    });

    // Populate sender info immediately for frontend update
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
    if (!team) return res.status(404).json({ success: false, message: "Team not found" });
    
    // Check membership (optional: public teams might allow reading?)
    const isMember = team.members.some(m => m.userId === userId);
    if (!isMember) return res.status(403).json({ success: false, message: "Join team to view messages" });

    const messages = await TeamMessage.find({ teamId })
      .sort({ createdAt: 1 }) // Oldest first (chat style)
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
    if(!team) return res.status(404).json({ success: false, message: 'Team not found'});

    if (team.leader !== userId) {
        return res.status(403).json({ success: false, message: "Only the Team Leader can delete the team"});
    }

    await TeamMessage.deleteMany({ teamId });
    await team.deleteOne();

    res.json({ success: true, message: "Team deleted successfully"});

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Remove Member (Kick)
// -----------------------------
export const removeMember = async (req, res) => {
    try {
        const { teamId, memberId } = req.body;
        const auth = req.auth();
        const userId = auth?.userId; // Requester (Leader)

        const team = await Team.findById(teamId);
        if(!team) return res.status(404).json({ success: false, message: 'Team not found'});

         // Verify requester is leader
         if (team.leader !== userId) {
            return res.status(403).json({ success: false, message: "Permission denied" });
        }

        // Cannot remove leader
        if (memberId === team.leader) {
             return res.status(400).json({ success: false, message: "Cannot remove team leader" });
        }

        team.members = team.members.filter(m => m.userId !== memberId);
        await team.save();

        res.json({ success: true, message: "Member removed" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
