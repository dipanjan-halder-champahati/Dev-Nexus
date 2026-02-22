import { TrophyIcon, UsersIcon, ActivityIcon } from "lucide-react";

const cardData = [
  {
    key: "active",
    icon: UsersIcon,
    label: "Active Sessions",
    badge: "LIVE",
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    glow: "rgba(99,102,241,0.3)",
    badgeColor: "#22c55e",
    badgeBg: "rgba(34,197,94,0.1)",
    badgeBorder: "rgba(34,197,94,0.25)",
    dotPulse: true,
  },
  {
    key: "recent",
    icon: TrophyIcon,
    label: "Total Sessions",
    badge: "ALL TIME",
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
    glow: "rgba(245,158,11,0.3)",
    badgeColor: "#f59e0b",
    badgeBg: "rgba(245,158,11,0.1)",
    badgeBorder: "rgba(245,158,11,0.25)",
    dotPulse: false,
  },
];

function StatCard({ config, value, delay }) {
  const Icon = config.icon;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');

        .stat-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 28px;
          transition: all 0.25s ease;
          animation: statFadeIn 0.5s ease both;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }
        .stat-card:hover {
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
          background: rgba(255,255,255,0.035);
        }
        @keyframes statFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div className="stat-card" style={{ animationDelay: `${delay}s` }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: config.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 6px 20px ${config.glow}`,
            }}
          >
            <Icon size={22} color="#fff" />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: config.badgeBg,
              border: `1px solid ${config.badgeBorder}`,
              padding: "4px 10px",
              borderRadius: 20,
            }}
          >
            {config.dotPulse && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: config.badgeColor,
                  display: "inline-block",
                  animation: "dotBlink 2s infinite",
                }}
              />
            )}
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: config.badgeColor,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.06em",
              }}
            >
              {config.badge}
            </span>
          </div>
        </div>

        {/* Value */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            marginBottom: 6,
            background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {value}
        </div>

        <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
          {config.label}
        </div>
      </div>
    </>
  );
}

function StatsCards({ activeSessionsCount, recentSessionsCount }) {
  return (
    <div
      style={{
        gridColumn: "span 1",
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 16,
      }}
    >
      <StatCard config={cardData[0]} value={activeSessionsCount} delay={0} />
      <StatCard config={cardData[1]} value={recentSessionsCount} delay={0.1} />
    </div>
  );
}

export default StatsCards;