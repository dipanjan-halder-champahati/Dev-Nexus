import { Code2, Clock, Users, Trophy, Loader } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";

const difficultyConfig = {
  easy: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  hard: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
};

function SessionCard({ session, index }) {
  const isActive = session.status === "active";
  const diff = difficultyConfig[session.difficulty?.toLowerCase()] || difficultyConfig.easy;

  return (
    <>
      <style>{`
        @keyframes cardSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .recent-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px;
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
          animation: cardSlideUp 0.4s ease both;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .recent-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
        }
        .recent-card:hover {
          border-color: rgba(99,102,241,0.25);
          background: rgba(255,255,255,0.04);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }
        .recent-card-active {
          background: rgba(34,197,94,0.04) !important;
          border-color: rgba(34,197,94,0.2) !important;
        }
        .recent-card-active:hover {
          border-color: rgba(34,197,94,0.4) !important;
        }
        @keyframes activePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>

      <div
        className={`recent-card ${isActive ? "recent-card-active" : ""}`}
        style={{ animationDelay: `${index * 0.07}s` }}
      >
        {/* Active badge */}
        {isActive && (
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.25)",
              padding: "3px 10px",
              borderRadius: 20,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                animation: "activePulse 2s infinite",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em" }}>
              LIVE
            </span>
          </div>
        )}

        {/* Top */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: isActive
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: isActive
                ? "0 4px 15px rgba(34,197,94,0.3)"
                : "0 4px 15px rgba(99,102,241,0.3)",
            }}
          >
            <Code2 size={20} color="#fff" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#f1f5f9",
                margin: "0 0 6px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                paddingRight: isActive ? 60 : 0,
              }}
            >
              {session.problem}
            </p>
            <span
              style={{
                background: diff.bg,
                border: `1px solid ${diff.border}`,
                color: diff.color,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "2px 8px",
                borderRadius: 4,
                textTransform: "uppercase",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {session.difficulty}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b" }}>
            <Clock size={13} />
            <span style={{ fontSize: 12 }}>
              {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b" }}>
            <Users size={13} />
            <span style={{ fontSize: 12 }}>
              {session.participant ? "2" : "1"} participant{session.participant ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'JetBrains Mono', monospace" }}>
            {isActive ? "Ongoing" : "Completed"}
          </span>
          <span style={{ fontSize: 11, color: "#334155" }}>
            {new Date(session.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>
    </>
  );
}

function RecentSessions({ sessions, isLoading }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20,
          overflow: "hidden",
          marginTop: 24,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 15px rgba(6,182,212,0.3)",
            }}
          >
            <Clock size={18} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", margin: 0, letterSpacing: "-0.02em" }}>
              Past Sessions
            </h2>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>Your coding history</p>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 28px 28px" }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <Loader size={36} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ) : sessions.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 14,
              }}
            >
              {sessions.map((session, i) => (
                <SessionCard key={session._id} session={session} index={i} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  margin: "0 auto 16px",
                  borderRadius: 20,
                  background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(139,92,246,0.1))",
                  border: "1px solid rgba(6,182,212,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trophy size={32} color="#06b6d4" style={{ opacity: 0.5 }} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>
                No sessions yet
              </p>
              <p style={{ fontSize: 13, color: "#475569" }}>Start your coding journey today!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default RecentSessions;