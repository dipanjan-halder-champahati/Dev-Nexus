export function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-room", ({ roomId }) => {
      if (!roomId) return;
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("code-change", ({ roomId, code }) => {
      if (!roomId) return;
      socket.to(roomId).emit("code-update", { code });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
