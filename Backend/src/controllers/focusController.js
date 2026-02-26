import Session from "../models/Session.js";

/**
 * POST /api/sessions/:id/focus-event
 *
 * Records a focus-mode violation for analytics / proctoring logs.
 * Body: { event: "tab-switch" | "fullscreen-exit" }
 */
export async function recordFocusEvent(req, res) {
  try {
    const { id } = req.params;
    const { event } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;
    const userName = req.user.name || "Unknown";

    if (!event || !["tab-switch", "fullscreen-exit"].includes(event)) {
      return res.status(400).json({ message: "Invalid event type" });
    }

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Only session members may report
    const isHost = session.host.toString() === userId.toString();
    const isParticipant =
      session.participant && session.participant.toString() === userId.toString();
    if (!isHost && !isParticipant) {
      return res.status(403).json({ message: "Not a session member" });
    }

    // Push to focusEvents array on the session document
    session.focusEvents = session.focusEvents || [];
    session.focusEvents.push({
      user: userId,
      clerkId,
      userName,
      event,
      timestamp: new Date(),
    });
    await session.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in recordFocusEvent:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}
