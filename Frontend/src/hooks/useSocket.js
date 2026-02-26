import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

/**
 * Real-time collaboration socket hook.
 *
 * Features:
 * - Automatic reconnection with exponential back-off
 * - Initial state sync on join (server sends room-state)
 * - Debounced local code emission (300 ms) to avoid thrashing
 * - Language change sync
 * - isRemoteUpdate guard prevents echo loops
 *
 * @param {string}   roomId           - socket room to join (session callId)
 * @param {function} onCodeUpdate     - called when a remote code change arrives
 * @param {function} onLanguageUpdate - called when remote language change arrives
 * @param {function} onRoomState      - called once when server sends full room state on join
 */
export default function useSocket(roomId, onCodeUpdate, onLanguageUpdate, onRoomState) {
  const socketRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const debounceTimer = useRef(null);
  const roomIdRef = useRef(roomId);

  // Keep roomId ref current so callbacks use latest value
  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const socket = io("/", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[socket] connected:", socket.id);
      socket.emit("join-room", { roomId });
    });

    // Server sends full room state when we join (code + language)
    socket.on("room-state", (state) => {
      if (state) {
        isRemoteUpdate.current = true;
        onRoomState?.(state);
      }
    });

    // Remote code change
    socket.on("code-update", ({ code }) => {
      isRemoteUpdate.current = true;
      onCodeUpdate(code);
    });

    // Remote language change
    socket.on("language-update", ({ language }) => {
      isRemoteUpdate.current = true;
      onLanguageUpdate?.(language);
    });

    // Reconnection: re-join room to get latest state
    socket.on("reconnect", () => {
      console.log("[socket] reconnected, re-joining room");
      socket.emit("join-room", { roomId: roomIdRef.current });
    });

    return () => {
      clearTimeout(debounceTimer.current);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Emit a code change, debounced 300 ms.
   * Skips emission when the change originated from a remote update.
   */
  const emitCodeChange = useCallback(
    (code) => {
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
      }
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        socketRef.current?.emit("code-change", {
          roomId: roomIdRef.current,
          code,
        });
      }, 300);
    },
    [], // stable — uses refs internally
  );

  /**
   * Emit a language change immediately (no debounce needed).
   */
  const emitLanguageChange = useCallback((language) => {
    socketRef.current?.emit("language-change", {
      roomId: roomIdRef.current,
      language,
    });
  }, []);

  return { emitCodeChange, emitLanguageChange, socketRef };
}
