import Note from "../models/Note.js";

// Save / update notes (upsert)
export async function saveNote(req, res) {
  try {
    const { sessionId, content } = req.body;
    const userId = req.user._id;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const note = await Note.findOneAndUpdate(
      { sessionId, userId },
      { content: content ?? "" },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({ note });
  } catch (err) {
    console.error("Save note error:", err.message || err);
    return res.status(500).json({ error: "Failed to save note" });
  }
}

// Get notes for a session (for the current user)
export async function getNote(req, res) {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const note = await Note.findOne({ sessionId, userId });

    return res.status(200).json({ note: note || { content: "", sessionId, userId } });
  } catch (err) {
    console.error("Get note error:", err.message || err);
    return res.status(500).json({ error: "Failed to load note" });
  }
}
