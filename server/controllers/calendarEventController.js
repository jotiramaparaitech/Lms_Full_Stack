import CalendarEvent from "../models/CalendarEvent.js";
import Team from "../models/Team.js";

// ✅ Get events for student/leader (with Dropdown Support)
export const getMyTeamEvents = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;
    
    // Check for a specific team requested via dropdown
    const requestedTeamId = req.query.teamId; 

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 1️⃣ Find ALL teams where the user is a LEADER or MEMBER
    // We use .lean() to get plain JS objects, ensuring better performance and easier manipulation
    const allTeams = await Team.find({
      $or: [
        { leader: userId },
        { "members.userId": userId }
      ]
    }).select("name leader _id").lean();

    // If no teams found, return empty state immediately
    if (!allTeams || allTeams.length === 0) {
      return res.json({
        success: true,
        events: [],
        teams: [],
        teamId: null,
        isLeader: false,
        message: "No teams found"
      });
    }

    // 2️⃣ Determine which team to show
    let activeTeam = null;

    if (requestedTeamId) {
      // Find the requested team in the user's list of teams
      // We convert _id to string to ensure safe comparison
      activeTeam = allTeams.find(t => t._id.toString() === requestedTeamId);
    }

    // Fallback: If no valid ID sent, default to the first team found
    if (!activeTeam) {
      activeTeam = allTeams[0];
    }

    // 3️⃣ Fetch events ONLY for the active team
    const events = await CalendarEvent.find({ teamId: activeTeam._id }).sort({
      startDate: 1,
    });

    // Check if the current user is the leader of the ACTIVE team
    const isLeader = String(activeTeam.leader) === String(userId);

    // 4️⃣ Return data
    return res.json({
      success: true,
      events,
      teamId: activeTeam._id,
      isLeader,
      teams: allTeams, // ✅ Sends the list of teams to populate the dropdown
    });

  } catch (error) {
    console.error("❌ [getMyTeamEvents] error:", error);
    return res.json({ success: false, message: error.message });
  }
};


// ✅ Create event (Leader only)
export const createEvent = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    const {
      teamId,
      title,
      description,
      startDate,
      endDate,
      type,
      location,
      reminders,
      priority,
    } = req.body;

    if (!teamId || !title || !startDate || !endDate) {
      return res.json({
        success: false,
        message: "teamId, title, startDate, endDate are required",
      });
    }

    const newEvent = await CalendarEvent.create({
      teamId,
      createdBy: userId,
      title,
      description: description || "",
      startDate,
      endDate,
      type: type || "team-meeting",
      location: location || "TBD",
      reminders: reminders || [],
      priority: priority || "medium",
    });

    return res.json({
      success: true,
      message: "Event Created",
      event: newEvent,
    });
  } catch (error) {
    console.error("❌ [createEvent] Error:", error);
    return res.json({ success: false, message: error.message });
  }
};


// ✅ Update event (Leader only)
export const updateEvent = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;
    const { id } = req.params;

    const event = await CalendarEvent.findById(id);
    if (!event) {
      return res.json({ success: false, message: "Event not found" });
    }

    // Check leader
    const team = await Team.findById(event.teamId);
    // Use toString() for safe comparison of ObjectId vs String
    if (!team || String(team.leader) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only leader can update"
      });
    }

    const updated = await CalendarEvent.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    return res.json({ success: true, message: "Event Updated", event: updated });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ✅ Delete event (Leader only)
export const deleteEvent = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;
    const { id } = req.params;

    const event = await CalendarEvent.findById(id);
    if (!event) {
      return res.json({ success: false, message: "Event not found" });
    }

    const team = await Team.findById(event.teamId);
    // Use toString() for safe comparison of ObjectId vs String
    if (!team || String(team.leader) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only leader can delete"
      });
    }

    await CalendarEvent.findByIdAndDelete(id);

    return res.json({ success: true, message: "Event Deleted" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};