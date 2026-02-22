import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { useActiveSessions, useCreateSession, useMyRecentSessions } from "../hooks/useSessions";
import Navbar from "../components/Navbar";
import WelcomeSection from "../components/WelcomeSection";
import StatsCards from "../components/StatsCards";
import ActiveSessions from "../components/ActiveSessions";
import RecentSessions from "../components/RecentSessions";
import CreateSessionModal from "../components/CreateSessionModal";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomConfig, setRoomConfig] = useState({ problem: "", difficulty: "" });

  const createSessionMutation = useCreateSession();
  const { data: activeSessionsData, isLoading: loadingActiveSessions } = useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } = useMyRecentSessions();

  const handleCreateRoom = () => {
    if (!roomConfig.problem || !roomConfig.difficulty) return;
    createSessionMutation.mutate(
      {
        problem: roomConfig.problem,
        difficulty: roomConfig.difficulty.toLowerCase(),
      },
      {
        onSuccess: (data) => {
          setShowCreateModal(false);
          navigate(`/session/${data.session._id}`);
        },
      }
    );
  };

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];

  const isUserInSession = (session) => {
    if (!user?.id) return false;
    return session.host?.clerkId === user.id || session.participant?.clerkId === user.id;
  };

  return (
    <>
      {/* ── Atmospheric background ── */}
      <style>{`
        .dash-bg {
          background-color: oklch(var(--b1));
          position: relative;
          overflow-x: hidden;
        }
        .dash-bg::before {
          content: "";
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 50% at 10% -10%, oklch(var(--p) / .14) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 110%, oklch(var(--s) / .10) 0%, transparent 55%),
            radial-gradient(ellipse 50% 60% at 50% 50%, oklch(var(--a) / .04) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Grid-dot texture overlay */
        .dash-bg::after {
          content: "";
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle, oklch(var(--bc) / .06) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
          z-index: 0;
        }

        .dash-content {
          position: relative;
          z-index: 1;
        }

        /* Glowing divider */
        .glow-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            oklch(var(--p) / .5) 30%,
            oklch(var(--s) / .5) 70%,
            transparent 100%
          );
          margin: 0.5rem 0 2.5rem;
          border: none;
        }

        /* Floating section labels */
        .section-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: oklch(var(--p));
          background: oklch(var(--p) / .1);
          border: 1px solid oklch(var(--p) / .2);
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          margin-bottom: 1rem;
        }

        /* Stat card hover glow */
        .dash-stat-card {
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .dash-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px oklch(var(--p) / .18);
        }

        /* Pulse dot for active sessions */
        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: oklch(var(--su));
          box-shadow: 0 0 0 0 oklch(var(--su) / .6);
          animation: pulse-ring 2s ease infinite;
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 oklch(var(--su) / .6); }
          70%  { box-shadow: 0 0 0 8px oklch(var(--su) / 0); }
          100% { box-shadow: 0 0 0 0 oklch(var(--su) / 0); }
        }

        /* Fade-in animation for main sections */
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-1 { animation: fadeSlideUp .4s ease both; }
        .anim-2 { animation: fadeSlideUp .4s .1s ease both; }
        .anim-3 { animation: fadeSlideUp .4s .2s ease both; }
        .anim-4 { animation: fadeSlideUp .4s .3s ease both; }
      `}</style>

      <div className="dash-bg min-h-screen">
        <div className="dash-content">
          <Navbar />

          {/* ── Welcome banner ── */}
          <div className="anim-1">
            <WelcomeSection onCreateSession={() => setShowCreateModal(true)} />
          </div>

          {/* ── Main grid ── */}
          <div className="container mx-auto px-6 pb-20">

            {/* Stats row */}
            <div className="anim-2 mb-8">
              <div className="section-eyebrow">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                Overview
              </div>
              <StatsCards
                activeSessionsCount={activeSessions.length}
                recentSessionsCount={recentSessions.length}
              />
            </div>

            <hr className="glow-divider" />

            {/* Active sessions */}
            <div className="anim-3 mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="pulse-dot" />
                <h2 className="text-xl font-bold tracking-tight">Live Sessions</h2>
                {activeSessions.length > 0 && (
                  <span className="badge badge-success badge-sm font-bold">
                    {activeSessions.length} active
                  </span>
                )}
              </div>
              <ActiveSessions
                sessions={activeSessions}
                isLoading={loadingActiveSessions}
                isUserInSession={isUserInSession}
              />
            </div>

            {/* Recent sessions */}
            <div className="anim-4">
              <div className="section-eyebrow mb-5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                Recent History
              </div>
              <RecentSessions sessions={recentSessions} isLoading={loadingRecentSessions} />
            </div>
          </div>
        </div>
      </div>

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        roomConfig={roomConfig}
        setRoomConfig={setRoomConfig}
        onCreateRoom={handleCreateRoom}
        isCreating={createSessionMutation.isPending}
      />
    </>
  );
}

export default DashboardPage;