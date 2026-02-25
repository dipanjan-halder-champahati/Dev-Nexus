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
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
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
