import Team from "../models/Team.js";
import CalendarEvent from "../models/CalendarEvent.js";

export const isTeamLeader = async (req, res, next) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    let teamId = req.body.teamId;

    // ✅ If teamId not in body, try to get from eventId (for update/delete)
    if (!teamId && req.params.id) {
      const event = await CalendarEvent.findById(req.params.id);
      if (event) teamId = event.teamId;
    }

    if (!teamId) {
      return res.status(400).json({ success: false, message: "teamId is required" });
    }

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    if (team.leader !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only team leader can perform this action",
      });
    }

    req.team = team;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
