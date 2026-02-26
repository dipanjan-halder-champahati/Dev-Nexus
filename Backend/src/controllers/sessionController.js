import { chatClient, streamClient, upsertStreamUser } from "../lib/stream.js";
import Session from "../models/Session.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty, name, language, visibility, maxParticipants, problemList } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    // Clamp maxParticipants to 2–10 (default 2)
    const maxP = Math.max(2, Math.min(10, Number(maxParticipants) || 2));

    // ── 1. Ensure the host user exists in Stream ───────────────────
    await upsertStreamUser({
      id: clerkId,
      name: req.user.name || "Host",
      image: req.user.profileImage || "",
    });

    // ── 2. Generate a unique call id ───────────────────────────────
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // ── 3. Create Session document in MongoDB ──────────────────────
    // Build the problem list; always include the primary problem
    const pList = Array.isArray(problemList) && problemList.length > 0
      ? problemList.map((p) => ({ title: p.title || p, difficulty: (p.difficulty || difficulty || 'easy').toLowerCase() }))
      : [{ title: problem, difficulty: (difficulty || 'easy').toLowerCase() }];

    const session = await Session.create({
      problem,
      difficulty,
      host: userId,
      callId,
      name: name || "",
      language: language || "javascript",
      visibility: visibility || "private",
      maxParticipants: maxP,
      participants: [],
      problemList: pList,
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
    await session.populate("participants", "name profileImage email clerkId");

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
      .populate("participants", "name profileImage email clerkId")
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
      $or: [{ host: userId }, { participant: userId }, { participants: userId }],
    })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .populate("participants", "name profileImage email clerkId")
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
      .populate("participant", "name email profileImage clerkId")
      .populate("participants", "name email profileImage clerkId");

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

    // Check if user is already a participant
    const alreadyJoined = (session.participants || []).some(
      (p) => p.toString() === userId.toString()
    );
    if (alreadyJoined) {
      // Already in session — just return it
      await session.populate("host", "name profileImage email clerkId");
      await session.populate("participant", "name profileImage email clerkId");
      await session.populate("participants", "name profileImage email clerkId");
      return res.status(200).json({ session });
    }

    // Room-size check: total people = 1 (host) + participants.length
    const maxP = session.maxParticipants || 2;
    const currentCount = 1 + (session.participants || []).length;
    if (currentCount >= maxP) {
      return res.status(409).json({ message: "Room is full. Cannot join session." });
    }

    // Ensure participant exists in Stream
    await upsertStreamUser({
      id: clerkId,
      name: req.user.name || "Participant",
      image: req.user.profileImage || "",
    });

    // Add to new participants array
    session.participants = session.participants || [];
    session.participants.push(userId);
    // Keep legacy field pointing to first participant for backward compat
    if (!session.participant) {
      session.participant = userId;
    }
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
    await session.populate("participants", "name profileImage email clerkId");

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

    // Allow both host AND participants to end the session
    const isHost = session.host.toString() === userId.toString();
    const isParticipant =
      session.participant && session.participant.toString() === userId.toString();
    const isInParticipants = (session.participants || []).some(
      (p) => p.toString() === userId.toString()
    );

    if (!isHost && !isParticipant && !isInParticipants) {
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

/**
 * Save code for a session (auto-save from frontend).
 * Both host and participant can save.
 */
export async function saveCode(req, res) {
  try {
    const { id } = req.params;
    const { code, language } = req.body;
    const userId = req.user._id;

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Only session members can save
    const isHost = session.host.toString() === userId.toString();
    const isParticipant =
      session.participant && session.participant.toString() === userId.toString();
    const isInParticipants = (session.participants || []).some(
      (p) => p.toString() === userId.toString()
    );
    if (!isHost && !isParticipant && !isInParticipants) {
      return res.status(403).json({ message: "Only session members can save code" });
    }

    session.code = code ?? session.code;
    if (language) session.language = language;
    await session.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in saveCode controller:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}

/**
 * Update the problem list for a session (host only).
 * Body: { problemList: [{ title, difficulty }] }
 */
export async function updateProblemList(req, res) {
  try {
    const { id } = req.params;
    const { problemList } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(problemList) || problemList.length === 0) {
      return res.status(400).json({ message: "At least one problem is required" });
    }

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can update the problem list" });
    }

    session.problemList = problemList.map((p) => ({
      title: p.title,
      difficulty: (p.difficulty || 'easy').toLowerCase(),
    }));

    // If the current active problem was removed, switch to the first one
    const stillInList = session.problemList.some((p) => p.title === session.problem);
    if (!stillInList && session.problemList.length > 0) {
      session.problem = session.problemList[0].title;
      session.difficulty = session.problemList[0].difficulty;
    }

    await session.save();

    await session.populate("host", "name profileImage email clerkId");
    await session.populate("participant", "name profileImage email clerkId");
    await session.populate("participants", "name profileImage email clerkId");

    res.status(200).json({ session });
  } catch (error) {
    console.error("Error in updateProblemList controller:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}

/**
 * Change the problem for a session (host only).
 */
export async function changeProblem(req, res) {
  try {
    const { id } = req.params;
    const { problem, difficulty } = req.body;
    const userId = req.user._id;

    if (!problem) {
      return res.status(400).json({ message: "Problem is required" });
    }

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Only host can change the problem
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can change the problem" });
    }

    session.problem = problem;
    if (difficulty) session.difficulty = difficulty;
    await session.save();

    await session.populate("host", "name profileImage email clerkId");
    await session.populate("participant", "name profileImage email clerkId");
    await session.populate("participants", "name profileImage email clerkId");

    res.status(200).json({ session });
  } catch (error) {
    console.error("Error in changeProblem controller:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}