import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// One note doc per user per session
noteSchema.index({ sessionId: 1, userId: 1 }, { unique: true });

const Note = mongoose.model("Note", noteSchema);

export default Note;
