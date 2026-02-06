import CalendarEvent from "../models/CalendarEvent.js";
import Team from "../models/Team.js";

// ✅ Get events for student (only view)
export const getMyTeamEvents = async (req, res) => {
  try {

    const auth = req.auth();
    const userId = auth?.userId;


    // 1️⃣ First look for team where I am LEADER
    let team = await Team.findOne({ leader: userId });

    // 2️⃣ If not leader, look for team where I am MEMBER
    if (!team) {
      team = await Team.findOne({ "members.userId": userId });
    }


    if (!team) {

      return res.json({
        success: true,
        events: [],
        teamId: null,
        isLeader: false,
      });
    }

    const events = await CalendarEvent.find({ teamId: team._id }).sort({
      startDate: 1,
    });

    const isLeader = String(team.leader) === String(userId);

    return res.json({
      success: true,
      events,
      teamId: team._id,
      isLeader,
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
      console.warn("❌ [createEvent] Missing required fields", {
        teamId,
        title,
        startDate,
        endDate,
      });

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
    if (!team || team.leader.toString() !== userId.toString()) {
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
    if (!team || team.leader.toString() !== userId.toString()) {
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
