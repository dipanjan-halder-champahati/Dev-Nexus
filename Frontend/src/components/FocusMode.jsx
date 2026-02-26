import {
  AlertTriangleIcon,
  EyeIcon,
  EyeOffIcon,
  MonitorIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   FocusModeToggle — shown in the session top-bar (host only)
   ═══════════════════════════════════════════════════════════ */
export function FocusModeToggle({ enabled, onToggle, isHost }) {
  if (!isHost) return null;

  return (
    <button
      onClick={onToggle}
      title={enabled ? "Disable Focus Mode" : "Enable Focus Mode"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 700,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        cursor: "pointer",
        border: enabled
          ? "1px solid rgba(251,191,36,.35)"
          : "1px solid rgba(255,255,255,.1)",
        background: enabled
          ? "rgba(251,191,36,.12)"
          : "rgba(255,255,255,.04)",
        color: enabled ? "#fbbf24" : "rgba(232,234,240,.5)",
        transition: "all .2s ease",
        whiteSpace: "nowrap",
      }}
    >
      {enabled ? <EyeIcon size={13} /> : <EyeOffIcon size={13} />}
      Focus Mode: {enabled ? "ON" : "OFF"}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   FocusViolationBadge — compact counter for top-bar
   ═══════════════════════════════════════════════════════════ */
export function FocusViolationBadge({ totalViolations, tabSwitchCount, fullscreenExitCount, enabled }) {
  if (!enabled) return null;

  return (
    <div
      title={`Tab switches: ${tabSwitchCount} · Fullscreen exits: ${fullscreenExitCount}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 12px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 700,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background:
          totalViolations > 0
            ? "rgba(248,113,113,.12)"
            : "rgba(52,211,153,.1)",
        border:
          totalViolations > 0
            ? "1px solid rgba(248,113,113,.3)"
            : "1px solid rgba(52,211,153,.25)",
        color: totalViolations > 0 ? "#f87171" : "#34d399",
        whiteSpace: "nowrap",
      }}
    >
      {totalViolations > 0 ? (
        <ShieldAlertIcon size={12} />
      ) : (
        <ShieldCheckIcon size={12} />
      )}
      {totalViolations > 0
        ? `Violations: ${totalViolations}`
        : "No violations"}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FocusWarningOverlay — floating warnings for participant
   ═══════════════════════════════════════════════════════════ */
export function FocusWarningOverlay({ warnings }) {
  if (!warnings.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {warnings.map((w) => (
        <div
          key={w.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 20px",
            borderRadius: 14,
            background: "rgba(248, 113, 113, .14)",
            border: "1px solid rgba(248, 113, 113, .35)",
            backdropFilter: "blur(18px)",
            color: "#fca5a5",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            boxShadow:
              "0 8px 32px rgba(248,113,113,.18), 0 0 0 1px rgba(248,113,113,.08)",
            animation: "focusWarnSlide .35s cubic-bezier(.22,1,.36,1)",
            pointerEvents: "auto",
            maxWidth: 440,
          }}
        >
          <AlertTriangleIcon size={16} style={{ flexShrink: 0, color: "#f87171" }} />
          <span>{w.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HostNotificationPanel — shows live violation feed for host
   ═══════════════════════════════════════════════════════════ */
export function HostNotificationPanel({ notifications, enabled, isHost }) {
  if (!isHost || !enabled || !notifications.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9998,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        maxWidth: 340,
      }}
    >
      {notifications.map((n) => (
        <div
          key={n.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 12,
            background: "rgba(251,191,36,.1)",
            border: "1px solid rgba(251,191,36,.28)",
            backdropFilter: "blur(16px)",
            color: "#fde68a",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            boxShadow: "0 6px 24px rgba(0,0,0,.35)",
            animation: "focusWarnSlide .3s cubic-bezier(.22,1,.36,1)",
          }}
        >
          <MonitorIcon size={14} style={{ flexShrink: 0, color: "#fbbf24" }} />
          <span style={{ flex: 1 }}>{n.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FocusModeStyles — injected once, contains keyframes
   ═══════════════════════════════════════════════════════════ */
export function FocusModeStyles() {
  return (
    <style>{`
      @keyframes focusWarnSlide {
        from { opacity: 0; transform: translateY(-12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}
