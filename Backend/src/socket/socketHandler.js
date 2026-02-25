/**
 * In-memory room state: stores latest code + language per room.
 * Survives across connections so refreshing / late joiners get synced.
 * Structure:  roomId → { code, language, lastUpdatedBy, updatedAt }
 */
const roomState = new Map();

// Cleanup rooms that have been idle for 2 hours
const ROOM_TTL_MS = 2 * 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [roomId, state] of roomState) {
    if (now - state.updatedAt > ROOM_TTL_MS) {
      roomState.delete(roomId);
    }
  }
}, 10 * 60 * 1000); // run every 10 min

export function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Track which room this socket is in (for cleanup)
    let currentRoom = null;

    // ── Join room: send existing state if any ──
    socket.on("join-room", ({ roomId }) => {
      if (!roomId) return;
      currentRoom = roomId;
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);

      // Send existing room state so late joiners / refreshers get synced
      const state = roomState.get(roomId);
      if (state) {
        socket.emit("room-state", {
          code: state.code,
          language: state.language,
        });
      }
    });

    // ── Code change: store + broadcast ──
    socket.on("code-change", ({ roomId, code }) => {
      if (!roomId) return;

      // Update server-side state
      const existing = roomState.get(roomId) || {};
      roomState.set(roomId, {
        ...existing,
        code,
        lastUpdatedBy: socket.id,
        updatedAt: Date.now(),
      });

      // Broadcast to others in the room
      socket.to(roomId).emit("code-update", { code });
    });

    // ── Language change: store + broadcast ──
    socket.on("language-change", ({ roomId, language }) => {
      if (!roomId) return;

      const existing = roomState.get(roomId) || {};
      roomState.set(roomId, {
        ...existing,
        language,
        lastUpdatedBy: socket.id,
        updatedAt: Date.now(),
      });

      socket.to(roomId).emit("language-update", { language });
    });

    // ── Cursor position sharing (lightweight, no state storage) ──
    socket.on("cursor-change", ({ roomId, cursor }) => {
      if (!roomId) return;
      socket.to(roomId).emit("cursor-update", { socketId: socket.id, cursor });
    });

    // ── Disconnect ──
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Notify others in the room that a user left
      if (currentRoom) {
        socket.to(currentRoom).emit("user-left", { socketId: socket.id });
      }
    });
  });
}
