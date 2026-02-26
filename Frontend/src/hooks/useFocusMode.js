import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Focus-mode / proctored-session hook.
 *
 * Detects:
 *  – tab / window visibility loss  (Page Visibility API)
 *  – fullscreen exit
 *
 * Provides:
 *  – violation counters (tabSwitchCount, fullscreenExitCount)
 *  – a warning message stack (auto-dismiss)
 *  – helpers: requestFullscreen(), toggleFocusMode()
 *
 * When a violation happens and a socket is present, emits
 *   "focus-violation" → { roomId, userId, userName, type, count }
 * and listens for
 *   "focus-violation" from others → onRemoteViolation(data)
 *
 * @param {Object}  opts
 * @param {boolean} opts.enabled        – current toggle state
 * @param {string}  opts.roomId         – socket room / session callId
 * @param {string}  opts.userId         – current user clerk id
 * @param {string}  opts.userName       – display name
 * @param {Object}  opts.socketRef      – { current: socket | null }
 * @param {boolean} opts.isHost         – is the current user the host?
 */
export default function useFocusMode({
  enabled = false,
  roomId,
  userId,
  userName,
  socketRef,
  isHost = false,
}) {
  /* ── State ── */
  const [focusEnabled, setFocusEnabled] = useState(enabled);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [warnings, setWarnings] = useState([]); // { id, message, ts }
  const [hostNotifications, setHostNotifications] = useState([]); // { id, message, ts }

  // Keep a ref so event listeners always read the latest value
  const focusRef = useRef(focusEnabled);
  useEffect(() => {
    focusRef.current = focusEnabled;
  }, [focusEnabled]);

  /* ── Warning helpers ── */
  const pushWarning = useCallback((message) => {
    const id = Date.now() + Math.random();
    setWarnings((prev) => [...prev, { id, message, ts: Date.now() }]);
    // auto-dismiss after 4 s
    setTimeout(() => {
      setWarnings((prev) => prev.filter((w) => w.id !== id));
    }, 4000);
  }, []);

  const pushHostNotification = useCallback((message) => {
    const id = Date.now() + Math.random();
    setHostNotifications((prev) => [...prev, { id, message, ts: Date.now() }]);
    setTimeout(() => {
      setHostNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 6000);
  }, []);

  /* ── Emit violation via socket ── */
  const emitViolation = useCallback(
    (type, count) => {
      const socket = socketRef?.current;
      if (!socket || !roomId) return;
      socket.emit("focus-violation", {
        roomId,
        userId,
        userName,
        type, // "tab-switch" | "fullscreen-exit"
        count,
      });
    },
    [roomId, userId, userName, socketRef],
  );

  /* ── Visibility change listener ── */
  useEffect(() => {
    const handler = () => {
      if (!focusRef.current) return;
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          emitViolation("tab-switch", next);
          return next;
        });
        pushWarning("You left the session tab. This action has been recorded.");
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [emitViolation, pushWarning]);

  /* ── Fullscreen change listener ── */
  useEffect(() => {
    // We only care when fullscreen was active (focus mode on) and user exits it
    const handler = () => {
      if (!focusRef.current) return;
      if (!document.fullscreenElement) {
        setFullscreenExitCount((prev) => {
          const next = prev + 1;
          emitViolation("fullscreen-exit", next);
          return next;
        });
        pushWarning("You exited fullscreen mode. This action has been recorded.");
      }
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [emitViolation, pushWarning]);

  /* ── Listen for remote violations (host sees participant events) ── */
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const handler = (data) => {
      // Don't show your own violations in the host panel
      if (data.userId === userId) return;
      const label =
        data.type === "tab-switch" ? "switched tabs" : "exited fullscreen";
      pushHostNotification(`${data.userName || "Participant"} ${label} (×${data.count})`);
    };

    socket.on("focus-violation", handler);
    return () => socket.off("focus-violation", handler);
  }, [socketRef, userId, pushHostNotification]);

  /* ── Broadcast focus-mode toggle to room ── */
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !roomId) return;
    // Only host broadcasts
    if (isHost) {
      socket.emit("focus-mode-toggle", { roomId, enabled: focusEnabled });
    }
  }, [focusEnabled, socketRef, roomId, isHost]);

  /* ── Listen for host toggling focus mode (participant side) ── */
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;
    const handler = ({ enabled: flag }) => {
      setFocusEnabled(flag);
      if (flag) {
        pushWarning("Focus Mode has been enabled by the host. Stay on this tab.");
        // Attempt fullscreen
        document.documentElement.requestFullscreen?.().catch(() => {});
      }
    };
    socket.on("focus-mode-toggle", handler);
    return () => socket.off("focus-mode-toggle", handler);
  }, [socketRef, pushWarning]);

  /* ── Toggle helper (host only) ── */
  const toggleFocusMode = useCallback(() => {
    setFocusEnabled((prev) => {
      const next = !prev;
      if (next) {
        // Enter fullscreen when enabling
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        // Exit fullscreen when disabling
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        }
      }
      return next;
    });
  }, []);

  /* ── Reset counters (useful on toggle off) ── */
  const resetCounters = useCallback(() => {
    setTabSwitchCount(0);
    setFullscreenExitCount(0);
  }, []);

  return {
    focusEnabled,
    toggleFocusMode,
    tabSwitchCount,
    fullscreenExitCount,
    totalViolations: tabSwitchCount + fullscreenExitCount,
    warnings,
    hostNotifications,
    resetCounters,
  };
}
