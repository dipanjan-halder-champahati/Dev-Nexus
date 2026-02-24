import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

export default function useSocket(roomId, onCodeUpdate) {
  const socketRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const socket = io("/", { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-room", { roomId });
    });

    socket.on("code-update", ({ code }) => {
      isRemoteUpdate.current = true;
      onCodeUpdate(code);
    });

    return () => {
      clearTimeout(debounceTimer.current);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const emitCodeChange = useCallback(
    (code) => {
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
      }
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        socketRef.current?.emit("code-change", { roomId, code });
      }, 250);
    },
    [roomId],
  );

  return { emitCodeChange };
}
