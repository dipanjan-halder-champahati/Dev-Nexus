import {
  ArrowRightIcon,
  Code2Icon,
  CrownIcon,
  SparklesIcon,
  UsersIcon,
  ZapIcon,
  LoaderIcon,
  WifiIcon,
} from "lucide-react";
import { Link } from "react-router";
import { getDifficultyBadgeClass } from "../lib/utils";

const difficultyConfig = {
  easy: {
    label: "Easy",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
  },
  medium: {
    label: "Medium",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
  },
  hard: {
    label: "Hard",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
  },
};

function DifficultyPill({ difficulty }) {
  const cfg = difficultyConfig[difficulty?.toLowerCase()] || difficultyConfig.easy;
  return (
    <span
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        padding: "2px 8px",
        borderRadius: "4px",
        textTransform: "uppercase",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {cfg.label}
    </span>
  );
}

function SessionRow({ session, isUserInSession, index }) {
  const isFull = session.participant && !isUserInSession(session);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        transition: "all 0.2s ease",
        animation: `slideIn 0.3s ease ${index * 0.06}s both`,
        cursor: isFull ? "default" : "pointer",
      }}
      className="session-row"
    >
      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          flexShrink: 0,
          boxShadow: "0 4px 15px rgba(99,102,241,0.3)",
        }}
      >
        <Code2Icon size={20} color="#fff" />
        <span
          style={{
            position: "absolute",
            top: -3,
            right: -3,
            width: 10,
            height: 10,
            background: "#22c55e",
            borderRadius: "50%",
            border: "2px solid #0a0a0f",
            animation: "pulse 2s infinite",
          }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: "#f1f5f9",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {session.problem}
          </span>
          <DifficultyPill difficulty={session.difficulty} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#94a3b8" }}>
            <CrownIcon size={12} color="#f59e0b" />
            <span style={{ fontSize: 12, fontWeight: 500 }}>{session.host?.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <UsersIcon size={12} color="#94a3b8" />
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              {session.participant ? "2" : "1"}/2
            </span>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: isFull ? "#ef4444" : "#22c55e",
              background: isFull ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
              border: `1px solid ${isFull ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
              padding: "2px 7px",
              borderRadius: 4,
              textTransform: "uppercase",
            }}
          >
            {isFull ? "Full" : "Open"}
          </span>
        </div>
      </div>

      {/* CTA */}
      {isFull ? (
        <button
          disabled
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "transparent",
            color: "#4b5563",
            fontSize: 13,
            fontWeight: 600,
            cursor: "not-allowed",
          }}
        >
          Full
        </button>
      ) : (
        <Link
          to={`/session/${session._id}`}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
          }}
        >
          {isUserInSession(session) ? "Rejoin" : "Join"}
          <ArrowRightIcon size={14} />
        </Link>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .session-row:hover {
          background: rgba(255,255,255,0.04) !important;
          border-color: rgba(99,102,241,0.25) !important;
          transform: translateX(2px);
        }
      `}</style>
    </div>
  );
}

function ActiveSessions({ sessions, isLoading, isUserInSession }) {
  return (
    <div
      style={{
        gridColumn: "span 2",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        overflow: "hidden",
        backdropFilter: "blur(20px)",
        height: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "24px 28px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 15px rgba(99,102,241,0.3)",
            }}
          >
            <ZapIcon size={18} color="#fff" />
          </div>
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#f1f5f9",
                margin: 0,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Live Sessions
            </h2>
            <p style={{ fontSize: 12, color: "#64748b", margin: 0, marginTop: 1 }}>
              Real-time coding battles
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)",
            padding: "6px 12px",
            borderRadius: 20,
          }}
        >
          <WifiIcon size={12} color="#22c55e" />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#22c55e",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {sessions.length} LIVE
          </span>
        </div>
      </div>

      {/* Sessions list */}
      <div style={{ padding: "16px 28px 28px", maxHeight: 400, overflowY: "auto" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <LoaderIcon size={36} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : sessions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.map((session, i) => (
              <SessionRow
                key={session._id}
                session={session}
                isUserInSession={isUserInSession}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              animation: "fadeIn 0.5s ease",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                margin: "0 auto 16px",
                borderRadius: 20,
                background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
                border: "1px solid rgba(99,102,241,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SparklesIcon size={32} color="#6366f1" />
            </div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#94a3b8",
                marginBottom: 6,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              No active sessions
            </p>
            <p style={{ fontSize: 13, color: "#475569" }}>Be the first to create one!</p>
            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActiveSessions;