import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
    },
    problem: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    // Full list of problems selected for this session
    problemList: [
      {
        title: { type: String, required: true },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
      },
    ],
    language: {
      type: String,
      enum: ['javascript', 'python', 'java'],
      default: 'javascript',
    },
    visibility: {
      type: String,
      enum: ['private', 'public'],
      default: 'private',
    },
    maxParticipants: {
      type: Number,
      default: 2,
      min: 2,
      max: 10,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Legacy single-participant field kept for backward compat
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Multi-participant list (does NOT include host)
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    callId: {
      type: String,
      required: true,
      unique: true,
    },
    // Persisted code state — auto-saved from the client
    code: {
      type: String,
      default: '',
    },
    // Focus-mode proctoring logs
    focusEvents: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        clerkId: String,
        userName: String,
        event: { type: String, enum: ['tab-switch', 'fullscreen-exit'] },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Session = mongoose.model('Session', sessionSchema);

export default Session;
