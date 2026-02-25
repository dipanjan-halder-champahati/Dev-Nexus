import { Link, useLocation } from "react-router";
import { BookOpenIcon, LayoutDashboardIcon, SparklesIcon } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');

        .nav-link {
          position: relative;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: -0.01em;
        }
        .nav-link-inactive {
          color: #64748b;
          background: transparent;
        }
        .nav-link-inactive:hover {
          color: #e2e8f0;
          background: rgba(255,255,255,0.05);
        }
        .nav-link-active {
          color: #fff;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          box-shadow: 0 4px 15px rgba(99,102,241,0.35);
        }
        .nav-logo:hover {
          transform: scale(1.03);
        }
        .nav-logo {
          transition: transform 0.2s ease;
        }
        .navbar-gradient-line {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(139,92,246,0.4), transparent);
        }
      `}</style>

      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(10, 10, 18, 0.85)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            className="nav-logo"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background:
                  "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
              }}
            >
              <SparklesIcon size={20} color="#fff" />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  fontSize: 18,
                  background:
                    "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                TalentIQ
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "#475569",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                }}
              >
                CODE TOGETHER
              </span>
            </div>
          </Link>

          {/* Nav items */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Link
              to="/problems"
              className={`nav-link ${isActive("/problems") ? "nav-link-active" : "nav-link-inactive"}`}
            >
              <BookOpenIcon size={15} />
              <span>Problems</span>
            </Link>

            <Link
              to="/dashboard"
              className={`nav-link ${isActive("/dashboard") ? "nav-link-active" : "nav-link-inactive"}`}
            >
              <LayoutDashboardIcon size={15} />
              <span>Dashboard</span>
            </Link>

            <div
              style={{
                marginLeft: 12,
                padding: "4px",
                borderRadius: 50,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <UserButton />
            </div>
          </div>
        </div>
        <div className="navbar-gradient-line" />
      </nav>
    </>
  );
}

export default Navbar;
