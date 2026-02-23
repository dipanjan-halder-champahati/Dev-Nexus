import { chatClient, streamClient, upsertStreamUser } from "../lib/stream.js";
import Session from "../models/Session.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty, name, language, visibility } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    // ── 1. Ensure the host user exists in Stream ───────────────────
    // This covers the case where the Clerk webhook / inngest hasn't
    // synced this user to Stream yet. Without this, Stream returns 404
    // when we reference the user in created_by_id or members.
    await upsertStreamUser({
      id: clerkId,
      name: req.user.name || "Host",
      image: req.user.profileImage || "",
    });

    // ── 2. Generate a unique call id ───────────────────────────────
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // ── 3. Create Session document in MongoDB ──────────────────────
    const session = await Session.create({
      problem,
      difficulty,
      host: userId,
      callId,
      name: name || "",
      language: language || "javascript",
      visibility: visibility || "private",
    });

    // ── 4. Create Stream Video call ────────────────────────────────
    try {
      const call = streamClient.video.call("default", callId);
      await call.getOrCreate({
        data: {
          created_by_id: clerkId,
          members: [{ user_id: clerkId, role: "admin" }],
          custom: {
            problem,
            difficulty,
            sessionId: session._id.toString(),
          },
          settings_override: {
            screensharing: { enabled: true },
          },
        },
      });
    } catch (videoErr) {
      console.error("Stream Video call creation failed:", videoErr);
      // Clean up the DB document before throwing
      await Session.findByIdAndDelete(session._id);
      throw new Error(`Stream Video error: ${videoErr.message}`);
    }

    // ── 5. Create Stream Chat channel ──────────────────────────────
    try {
      const channel = chatClient.channel("messaging", callId, {
        name: name || `${problem} Session`,
        created_by_id: clerkId,
        members: [clerkId],
      });
      await channel.create();
    } catch (chatErr) {
      console.error("Stream Chat channel creation failed:", chatErr);
      // Clean up video call + DB
      try {
        await streamClient.video.call("default", callId).delete({ hard: true });
      } catch (_) {}
      await Session.findByIdAndDelete(session._id);
      throw new Error(`Stream Chat error: ${chatErr.message}`);
    }

    // ── 6. Return populated session ────────────────────────────────
    await session.populate("host", "name profileImage email clerkId");

    res.status(201).json({ session });
  } catch (error) {
    console.error("Error in createSession controller:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}

export async function getActiveSessions(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error in getActiveSessions controller:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error in getMyRecentSessions controller:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.status(200).json({ session });
  } catch (error) {
    console.error("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host cannot join their own session as participant" });
    }

    // check if session is already full - has a participant
    if (session.participant) return res.status(409).json({ message: "Session is full" });

    // Ensure participant exists in Stream
    await upsertStreamUser({
      id: clerkId,
      name: req.user.name || "Participant",
      image: req.user.profileImage || "",
    });

    session.participant = userId;
    await session.save();

    // Add participant to the video call
    try {
      const call = streamClient.video.call("default", session.callId);
      await call.updateCallMembers({
        update_members: [{ user_id: clerkId }],
      });
    } catch (e) {
      console.error("Failed to add member to video call:", e.message);
    }

    // Add participant to chat channel
    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    await session.populate("host", "name profileImage email clerkId");
    await session.populate("participant", "name profileImage email clerkId");

    res.status(200).json({ session });
  } catch (error) {
    console.error("Error in joinSession controller:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // Allow both host AND participant to end the session
    const isHost = session.host.toString() === userId.toString();
    const isParticipant =
      session.participant && session.participant.toString() === userId.toString();

    if (!isHost && !isParticipant) {
      return res.status(403).json({ message: "Only session members can end the session" });
    }

    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    // End the Stream Video call (soft end – keeps recordings)
    try {
      const call = streamClient.video.call("default", session.callId);
      await call.endCall();
    } catch (e) {
      console.error("Stream Video endCall failed (may already be ended):", e.message);
    }

    // Delete the chat channel
    try {
      const channel = chatClient.channel("messaging", session.callId);
      await channel.delete();
    } catch (e) {
      console.error("Stream Chat channel delete failed:", e.message);
    }

    session.status = "completed";
    session.endedAt = new Date();
    await session.save();

    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.error("Error in endSession controller:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}