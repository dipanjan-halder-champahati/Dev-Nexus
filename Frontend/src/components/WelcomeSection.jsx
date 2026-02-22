import { useUser } from "@clerk/clerk-react";
import { ArrowRightIcon, SparklesIcon, ZapIcon } from "lucide-react";

function WelcomeSection({ onCreateSession }) {
  const { user } = useUser();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');

        .welcome-section {
          position: relative;
          overflow: hidden;
          padding: 64px 24px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .welcome-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .create-btn {
          position: relative;
          padding: 14px 28px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          font-weight: 700;
          font-size: 15px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 8px 30px rgba(99,102,241,0.4);
          transition: all 0.25s ease;
          overflow: hidden;
        }
        .create-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #7c3aed, #6366f1);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(99,102,241,0.55);
        }
        .create-btn:hover::before { opacity: 1; }
        .create-btn:hover .arrow-icon { transform: translateX(4px); }
        .create-btn span, .create-btn svg { position: relative; z-index: 1; }
        .arrow-icon { transition: transform 0.2s ease; }

        .welcome-animate {
          animation: welcomeFadeUp 0.6s ease both;
        }
        @keyframes welcomeFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.25);
          color: #818cf8;
          font-size: 12px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 20px;
          letter-spacing: 0.05em;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
      `}</style>

      <div className="welcome-section">
        {/* Background orbs */}
        <div
          className="welcome-bg-orb"
          style={{ width: 500, height: 500, background: "rgba(99,102,241,0.08)", top: -200, left: -100 }}
        />
        <div
          className="welcome-bg-orb"
          style={{ width: 300, height: 300, background: "rgba(139,92,246,0.06)", top: -50, right: 200 }}
        />

        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          {/* Left content */}
          <div className="welcome-animate" style={{ flex: 1 }}>
            <div className="badge-pill">
              <SparklesIcon size={11} />
              Interview Platform
            </div>

            <h1
              style={{
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                margin: 0,
                marginBottom: 16,
                color: "#f1f5f9",
              }}
            >
              Welcome back,{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {user?.firstName || "Developer"}
              </span>
              !
            </h1>

            <p
              style={{
                fontSize: 17,
                color: "#64748b",
                margin: 0,
                fontWeight: 400,
                maxWidth: 420,
                lineHeight: 1.6,
              }}
            >
              Jump into a live coding session, practice with peers, and level up your interview game.
            </p>
          </div>

          {/* CTA */}
          <div className="welcome-animate" style={{ animationDelay: "0.15s" }}>
            <button onClick={onCreateSession} className="create-btn">
              <ZapIcon size={18} className="arrow-icon" />
              <span>Create Session</span>
              <ArrowRightIcon size={16} className="arrow-icon" />
            </button>
            <p
              style={{
                textAlign: "center",
                marginTop: 10,
                fontSize: 11,
                color: "#475569",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              1-on-1 · Real-time · Free
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomeSection;