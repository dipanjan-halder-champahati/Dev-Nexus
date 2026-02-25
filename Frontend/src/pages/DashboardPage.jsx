import { useNavigate, Link } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  useActiveSessions,
  useCreateSession,
  useMyRecentSessions,
} from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import Navbar from "../components/Navbar";
import CreateSessionModal from "../components/CreateSessionModal";
import {
  Code2Icon,
  UsersIcon,
  PlayIcon,
  ArrowRightIcon,
  ZapIcon,
  TrophyIcon,
  FlameIcon,
  CalendarIcon,
  ClockIcon,
  TerminalIcon,
  UserPlusIcon,
  HistoryIcon,
  SparklesIcon,
  ChevronRightIcon,
  LogInIcon,
  TargetIcon,
  ActivityIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/* ═══════════════════════════════════════════════
   ACTIVITY HEATMAP (LeetCode style)
   ═══════════════════════════════════════════════ */

function generateHeatmapData(sessionEvents = []) {
  // Build a map of dateStr -> count from provided session events
  const counts = {};
  for (const s of sessionEvents || []) {
    const d = s?.createdAt ? new Date(s.createdAt) : null;
    if (!d || Number.isNaN(d.getTime())) continue;
    const dateStr = d.toISOString().split("T")[0];
    counts[dateStr] = (counts[dateStr] || 0) + 1;
  }

  const data = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const count = counts[dateStr] || 0;
    data.push({ date: dateStr, count });
  }
  // If there are no sessionEvents, fall back to a small random sprinkle for demo purposes
  if ((sessionEvents?.length || 0) === 0) {
    for (let i = 0; i < data.length; i++) {
      const rand = Math.random();
      let c = 0;
      if (rand > 0.85) c = 1 + Math.ceil(Math.random() * 2);
      if (rand > 0.95) c += Math.ceil(Math.random() * 3);
      data[i].count = c;
    }
  }

  return data;
}

function getIntensity(count) {
  if (count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

const INTENSITY_COLORS = [
  "rgba(255,255,255,.04)",
  "#064e3b", // dark green
  "#0f766e",
  "#10b981",
  "#34d399",
];

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function Heatmap({ sessions = [] }) {
  const data = useMemo(() => generateHeatmapData(sessions), [sessions]);
  const [tooltip, setTooltip] = useState(null);

  // Build weeks (columns) — each column = 7 days (Sun–Sat)
  const weeks = useMemo(() => {
    const cols = [];
    let col = [];
    // Pad leading days so first day aligns to its weekday
    const firstDay = new Date(data[0].date).getDay();
    for (let i = 0; i < firstDay; i++) col.push(null);
    for (const d of data) {
      col.push(d);
      if (col.length === 7) {
        cols.push(col);
        col = [];
      }
    }
    if (col.length) {
      while (col.length < 7) col.push(null);
      cols.push(col);
    }
    return cols;
  }, [data]);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const validDay = week.find((d) => d);
      if (validDay) {
        const m = new Date(validDay.date).getMonth();
        if (m !== lastMonth) {
          labels.push({ month: MONTHS[m], col: wi });
          lastMonth = m;
        }
      }
    });
    return labels;
  }, [weeks]);

  const totalSubmissions = useMemo(
    () => data.reduce((s, d) => s + d.count, 0),
    [data]
  );
  const activeDays = useMemo(
    () => data.filter((d) => d.count > 0).length,
    [data]
  );

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <div>
          <span className="heatmap-count">{totalSubmissions}</span>
          <span className="heatmap-label"> submissions in the last year</span>
        </div>
        <div className="heatmap-legend">
          <span className="heatmap-legend-label">Less</span>
          {INTENSITY_COLORS.map((c, i) => (
            <div
              key={i}
              className="heatmap-legend-box"
              style={{ background: c }}
            />
          ))}
          <span className="heatmap-legend-label">More</span>
        </div>
      </div>

      {/* Month labels */}
      <div className="heatmap-months">
        {monthLabels.map(({ month, col }, i) => (
          <span
            key={i}
            className="heatmap-month"
            style={{ gridColumnStart: col + 2 }}
          >
            {month}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="heatmap-scroll">
        <div className="heatmap-grid" style={{ gridTemplateColumns: `auto repeat(${weeks.length}, 13px)` }}>
          {/* Day labels */}
          {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
            <span key={i} className="heatmap-day-label" style={{ gridRow: i + 1 }}>
              {d}
            </span>
          ))}

          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((day, di) => (
              <div
                key={`${wi}-${di}`}
                className="heatmap-cell"
                style={{
                  gridColumn: wi + 2,
                  gridRow: di + 1,
                  background: day
                    ? INTENSITY_COLORS[getIntensity(day.count)]
                    : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (day) {
                    const rect = e.target.getBoundingClientRect();
                    setTooltip({
                      text: `${day.count} submission${day.count !== 1 ? "s" : ""} on ${day.date}`,
                      x: rect.left + rect.width / 2,
                      y: rect.top - 8,
                    });
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            ))
          )}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="heatmap-tooltip"
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltip.text}
        </div>
      )}

      <div className="heatmap-footer">
        <span><FlameIcon size={13} style={{ display: "inline", verticalAlign: "-2px" }} /> {activeDays} active days</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════ */

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomConfig, setRoomConfig] = useState({ problem: "", difficulty: "", name: "", language: "javascript", visibility: "private" });
  const [joinCode, setJoinCode] = useState("");

  const createSessionMutation = useCreateSession();
  const { data: activeSessionsData, isLoading: loadingActiveSessions } =
    useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } =
    useMyRecentSessions();

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];

  const problems = useMemo(() => Object.values(PROBLEMS), []);

  const openCreateModal = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setRoomConfig({ problem: "", difficulty: "", name: "", language: "javascript", visibility: "private" });
    setShowCreateModal(true);
  };

  const handleCreateRoom = () => {
    if (!roomConfig.problem || !roomConfig.difficulty) return;
    createSessionMutation.mutate(
      {
        problem: roomConfig.problem,
        difficulty: roomConfig.difficulty.toLowerCase(),
        name: roomConfig.name || '',
        language: roomConfig.language || 'javascript',
        visibility: roomConfig.visibility || 'private',
      },
      {
        onSuccess: (data) => {
          setShowCreateModal(false);
          navigate(`/session/${data.session._id}`);
        },
      }
    );
  };

  const isUserInSession = (session) => {
    if (!user?.id) return false;
    return (
      session.host?.clerkId === user.id ||
      session.participant?.clerkId === user.id
    );
  };

  const firstName = user?.firstName || user?.username || "Developer";

  // Simulated stats — in production, fetch from API
  const stats = useMemo(() => {
    const userId = user?.id;

    // Combine recent + active sessions for richer stats
    const allSessions = [...recentSessions, ...activeSessions];

    // Sessions where user participated (host or participant)
    const mySessions = allSessions.filter(
      (s) => s && (s.host?.clerkId === userId || s.participant?.clerkId === userId)
    );

    // Problems solved: unique problem ids from completed sessions
    const completedByUser = mySessions.filter((s) => s.status === "completed");
    const solvedSet = new Set(completedByUser.map((s) => s.problem));
    const problemsSolved = solvedSet.size;

    // totalSubmissions: sum explicit submissionsCount when present, else estimate 1
    const totalSubmissions = mySessions.reduce(
      (acc, s) => acc + (s.submissionsCount || 1),
      0
    );

    // sessions created/joined (count across recent+active)
    const sessionsCreated = allSessions.filter((s) => s.host?.clerkId === userId).length;
    const sessionsJoined = allSessions.filter((s) => s.participant?.clerkId === userId).length;

    // Streak: consecutive days up to today where user had at least one session
    const dateSet = new Set(
      mySessions
        .map((s) => (s.createdAt ? new Date(s.createdAt).toISOString().split("T")[0] : null))
        .filter(Boolean)
    );

    let streak = 0;
    const today = new Date();
    for (let i = 0; ; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      if (dateSet.has(ds)) streak++; else break;
      // safety: max 365
      if (streak >= 365) break;
    }

    return {
      problemsSolved,
      totalSubmissions,
      sessionsCreated,
      sessionsJoined,
      streak,
    };
  }, [recentSessions, activeSessions, user?.id]);

  return (
    <>
      <style>{`
        /* ── Fonts ── */
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap');

        .dash-root {
          font-family: 'DM Sans', sans-serif;
          background: #060710;
          color: #e2e8f0;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* Subtle grid */
        .dash-root::before {
          content: "";
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,.04) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse 70% 50% at 50% 20%, black, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 70% 50% at 50% 20%, black, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        /* Ambient blobs */
        .dash-blob-1 {
          position: fixed; width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,.12), transparent 70%);
          top: -200px; left: -100px;
          filter: blur(100px); pointer-events: none; z-index: 0;
        }
        .dash-blob-2 {
          position: fixed; width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,.08), transparent 70%);
          bottom: -150px; right: -100px;
          filter: blur(100px); pointer-events: none; z-index: 0;
        }

        .dash-content {
          position: relative; z-index: 1;
          max-width: 1280px; margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }

        /* ── Scroll reveal ── */
        .dash-reveal {
          opacity: 0; transform: translateY(20px);
          transition: opacity .5s cubic-bezier(.22,1,.36,1), transform .5s cubic-bezier(.22,1,.36,1);
        }
        .dash-reveal.vis { opacity: 1; transform: translateY(0); }

        /* ── Section label ── */
        .section-label {
          display: flex; align-items: center; gap: .5rem;
          font-size: .85rem; font-weight: 700; color: #94a3b8;
          margin-bottom: 1rem; text-transform: uppercase;
          letter-spacing: .08em;
        }
        .section-label .label-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #6366f1;
          box-shadow: 0 0 8px rgba(99,102,241,.5);
        }

        /* ═════════════════════════
           WELCOME / HERO CARD
           ═════════════════════════ */
        .welcome-card {
          background: linear-gradient(135deg, rgba(99,102,241,.1), rgba(139,92,246,.06));
          border: 1px solid rgba(99,102,241,.15);
          border-radius: 24px;
          padding: 2.5rem 3rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 2rem;
          margin-bottom: 2.5rem;
          position: relative;
          overflow: hidden;
        }
        .welcome-card::before {
          content: "";
          position: absolute; top: -60%; right: -10%;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(99,102,241,.1), transparent 65%);
          pointer-events: none;
        }
        .welcome-greeting {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: .5rem;
        }
        .welcome-greeting span {
          background: linear-gradient(135deg, #818cf8, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .welcome-sub {
          color: #64748b; font-size: .95rem; margin-bottom: 1.5rem; max-width: 460px;
        }
        .welcome-stats {
          display: flex; gap: 2rem; margin-bottom: 1.5rem;
        }
        .welcome-stat-item {
          display: flex; flex-direction: column;
        }
        .welcome-stat-val {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem; font-weight: 900; color: #e2e8f0;
        }
        .welcome-stat-lbl {
          font-size: .72rem; color: #475569; font-weight: 600;
          text-transform: uppercase; letter-spacing: .08em;
        }
        .welcome-btns {
          display: flex; gap: .75rem; flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .welcome-card { flex-direction: column; padding: 2rem 1.5rem; }
        }

        /* ═════════════════════════
           BUTTONS
           ═════════════════════════ */
        .btn-primary {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .7rem 1.6rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 12px;
          font-weight: 700; font-size: .88rem; color: white;
          border: none; cursor: pointer;
          box-shadow: 0 4px 20px rgba(99,102,241,.35);
          transition: all .25s cubic-bezier(.22,1,.36,1);
          position: relative; overflow: hidden;
        }
        .btn-primary::after {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,.15) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform .5s;
        }
        .btn-primary:hover::after { transform: translateX(100%); }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(99,102,241,.45);
        }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .7rem 1.6rem;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px;
          font-weight: 600; font-size: .88rem; color: #94a3b8;
          cursor: pointer;
          transition: all .25s;
        }
        .btn-secondary:hover {
          background: rgba(99,102,241,.08);
          border-color: rgba(99,102,241,.25);
          color: #c4b5fd;
          transform: translateY(-1px);
        }

        .btn-sm {
          padding: .5rem 1.1rem; font-size: .8rem; border-radius: 10px;
        }

        /* ═════════════════════════
           QUICK ACTIONS
           ═════════════════════════ */
        .quick-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        @media (max-width: 900px) {
          .quick-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 500px) {
          .quick-grid { grid-template-columns: 1fr; }
        }
        .quick-card {
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 16px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all .3s cubic-bezier(.22,1,.36,1);
          display: flex; flex-direction: column; gap: .75rem;
          position: relative; overflow: hidden;
        }
        .quick-card::before {
          content: "";
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at top left, var(--qc-glow, rgba(99,102,241,.08)), transparent 60%);
          opacity: 0;
          transition: opacity .3s;
        }
        .quick-card:hover {
          border-color: rgba(255,255,255,.12);
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,.25);
        }
        .quick-card:hover::before { opacity: 1; }
        .quick-card-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          position: relative; z-index: 1;
        }
        .quick-card-title {
          font-weight: 700; font-size: .95rem; color: #e2e8f0;
          position: relative; z-index: 1;
        }
        .quick-card-desc {
          font-size: .78rem; color: #475569; line-height: 1.5;
          position: relative; z-index: 1;
        }

        /* ═════════════════════════
           STATS OVERVIEW
           ═════════════════════════ */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .stats-grid { grid-template-columns: 1fr; } }
        .stat-card {
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 16px;
          padding: 1.4rem 1.5rem;
          display: flex; align-items: center; gap: 1rem;
          transition: all .3s;
        }
        .stat-card:hover {
          border-color: rgba(255,255,255,.1);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,.2);
        }
        .stat-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem; font-weight: 900; color: #e2e8f0;
          line-height: 1;
        }
        .stat-label {
          font-size: .72rem; font-weight: 600; color: #475569;
          text-transform: uppercase; letter-spacing: .06em;
        }

        /* ═════════════════════════
           HEATMAP
           ═════════════════════════ */
        .heatmap-container {
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .heatmap-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem; flex-wrap: wrap; gap: .5rem;
        }
        .heatmap-count {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem; font-weight: 800; color: #e2e8f0;
        }
        .heatmap-label { font-size: .82rem; color: #64748b; }
        .heatmap-legend {
          display: flex; align-items: center; gap: 4px;
        }
        .heatmap-legend-label { font-size: .65rem; color: #475569; padding: 0 4px; }
        .heatmap-legend-box {
          width: 11px; height: 11px; border-radius: 2px;
        }
        .heatmap-months {
          display: grid;
          grid-template-columns: 28px repeat(53, 13px);
          gap: 2px;
          margin-bottom: 4px;
        }
        .heatmap-month {
          font-size: .6rem; color: #475569; font-weight: 600;
          white-space: nowrap;
        }
        .heatmap-scroll {
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .heatmap-grid {
          display: grid;
          grid-template-rows: repeat(7, 11px);
          gap: 2px;
          grid-auto-flow: column;
        }
        .heatmap-day-label {
          font-size: .58rem; color: #475569; width: 26px;
          display: flex; align-items: center;
        }
        .heatmap-cell {
          width: 11px; height: 11px;
          border-radius: 2px;
          transition: all .15s;
          cursor: crosshair;
        }
        .heatmap-cell:hover {
          outline: 1px solid rgba(255,255,255,.3);
          outline-offset: 1px;
          transform: scale(1.3);
        }
        .heatmap-tooltip {
          background: #1e293b; color: #e2e8f0;
          font-size: .72rem; font-weight: 600;
          padding: .4rem .65rem; border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,.5);
          white-space: nowrap; pointer-events: none;
          z-index: 100;
        }
        .heatmap-footer {
          margin-top: .75rem; font-size: .75rem; color: #475569;
          display: flex; gap: 1.5rem;
        }

        /* ═════════════════════════
           SESSIONS SECTION
           ═════════════════════════ */
        .two-col {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 2rem; margin-bottom: 2.5rem;
        }
        @media (max-width: 860px) { .two-col { grid-template-columns: 1fr; } }

        .session-card {
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 14px;
          padding: 1.1rem 1.3rem;
          display: flex; align-items: center; justify-content: space-between;
          transition: all .25s;
          gap: 1rem;
        }
        .session-card:hover {
          border-color: rgba(255,255,255,.1);
          background: rgba(255,255,255,.04);
        }
        .session-card-info { display: flex; flex-direction: column; gap: .2rem; min-width: 0; }
        .session-card-title {
          font-weight: 700; font-size: .9rem; color: #e2e8f0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .session-card-meta {
          display: flex; align-items: center; gap: .75rem;
          font-size: .72rem; color: #475569;
        }
        .session-card-meta span { display: inline-flex; align-items: center; gap: .25rem; }

        /* Active session pulse */
        .active-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 0 rgba(34,197,94,.5);
          animation: activePulse 2s ease infinite;
          flex-shrink: 0;
        }
        @keyframes activePulse {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,.5); }
          70%  { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }

        /* ═════════════════════════
           PROBLEMS LIST
           ═════════════════════════ */
        .problem-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: .9rem 1.2rem;
          border-radius: 12px;
          transition: background .2s;
          gap: 1rem;
        }
        .problem-row:hover { background: rgba(255,255,255,.03); }
        .problem-info { display: flex; align-items: center; gap: .75rem; min-width: 0; }
        .problem-title {
          font-weight: 600; font-size: .88rem; color: #e2e8f0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .badge-easy { background: rgba(34,197,94,.12); color: #22c55e; }
        .badge-medium { background: rgba(245,158,11,.12); color: #f59e0b; }
        .badge-hard { background: rgba(239,68,68,.12); color: #ef4444; }
        .diff-badge {
          font-size: .68rem; font-weight: 700; padding: .2rem .6rem;
          border-radius: 6px; text-transform: capitalize; white-space: nowrap;
        }

        /* ═════════════════════════
           EMPTY STATE
           ═════════════════════════ */
        .empty-state {
          text-align: center; padding: 2.5rem 1rem;
          color: #475569; font-size: .88rem;
        }
        .empty-state-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: rgba(255,255,255,.04);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto .75rem;
        }

        /* ═════════════════════════
           CARD WRAPPER
           ═════════════════════════ */
        .card-wrap {
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 16px;
          overflow: hidden;
        }
        .card-wrap-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 1.3rem;
          border-bottom: 1px solid rgba(255,255,255,.05);
        }
        .card-wrap-title {
          font-weight: 800; font-size: .95rem; color: #e2e8f0;
          display: flex; align-items: center; gap: .5rem;
        }
        .card-wrap-body { padding: .5rem; }

        /* ═════════════════════════
           JOIN INPUT
           ═════════════════════════ */
        .join-input-row {
          display: flex; gap: .5rem; margin-top: .5rem;
        }
        .join-input {
          flex: 1;
          padding: .55rem 1rem;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 10px;
          color: #e2e8f0;
          font-size: .82rem;
          font-family: 'JetBrains Mono', monospace;
          outline: none;
          transition: border-color .2s;
        }
        .join-input:focus {
          border-color: rgba(99,102,241,.4);
        }
        .join-input::placeholder { color: #334155; }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-1 { animation: fadeUp .5s ease both; }
        .anim-2 { animation: fadeUp .5s .08s ease both; }
        .anim-3 { animation: fadeUp .5s .16s ease both; }
        .anim-4 { animation: fadeUp .5s .24s ease both; }
        .anim-5 { animation: fadeUp .5s .32s ease both; }
        .anim-6 { animation: fadeUp .5s .40s ease both; }
      `}</style>

      <div className="dash-root">
        <div className="dash-blob-1" />
        <div className="dash-blob-2" />

        <Navbar />

        <div className="dash-content">

          {/* ═══════  WELCOME HERO CARD  ═══════ */}
          <div className="welcome-card anim-1">
            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="welcome-greeting">
                Welcome back, <span>{firstName}</span> 👋
              </div>
              <p className="welcome-sub">
                Keep up the great work! Every line of code brings you closer to mastery.
              </p>

              <div className="welcome-stats">
                <div className="welcome-stat-item">
                  <span className="welcome-stat-val">{stats.problemsSolved}</span>
                  <span className="welcome-stat-lbl">Solved</span>
                </div>
                <div className="welcome-stat-item">
                  <span className="welcome-stat-val">{stats.sessionsCreated}</span>
                  <span className="welcome-stat-lbl">Created</span>
                </div>
                <div className="welcome-stat-item">
                  <span className="welcome-stat-val">{stats.sessionsJoined}</span>
                  <span className="welcome-stat-lbl">Joined</span>
                </div>
              </div>

              <div className="welcome-btns">
                <Link to="/problems" style={{ textDecoration: "none" }}>
                  <button className="btn-primary">
                    <PlayIcon size={15} />
                    Start Practice
                  </button>
                </Link>
                <button
                  className="btn-primary"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}
                  onClick={openCreateModal}
                >
                  <UsersIcon size={15} />
                  Create Session
                </button>
              </div>
            </div>
          </div>

          {/* ═══════  QUICK ACTIONS  ═══════ */}
          <div className="section-label anim-2">
            <div className="label-dot" />
            Quick Actions
          </div>
          <div className="quick-grid anim-2">
            <div
              className="quick-card"
              style={{ "--qc-glow": "rgba(99,102,241,.1)" }}
              onClick={() => navigate("/problems")}
            >
              <div className="quick-card-icon" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
                <Code2Icon size={20} color="white" />
              </div>
              <div className="quick-card-title">Solo Practice</div>
              <div className="quick-card-desc">Pick a problem and sharpen your skills alone.</div>
            </div>

            <div
              className="quick-card"
              style={{ "--qc-glow": "rgba(139,92,246,.1)" }}
              onClick={openCreateModal}
            >
              <div className="quick-card-icon" style={{ background: "linear-gradient(135deg, #8b5cf6, #a78bfa)" }}>
                <UsersIcon size={20} color="white" />
              </div>
              <div className="quick-card-title">Create Session</div>
              <div className="quick-card-desc">Start a live collaborative coding session.</div>
            </div>

            <div
              className="quick-card"
              style={{ "--qc-glow": "rgba(6,182,212,.1)" }}
              onClick={() => document.getElementById("join-input")?.focus()}
            >
              <div className="quick-card-icon" style={{ background: "linear-gradient(135deg, #0891b2, #06b6d4)" }}>
                <LogInIcon size={20} color="white" />
              </div>
              <div className="quick-card-title">Join Session</div>
              <div className="quick-card-desc">Enter a room code to join a friend's session.</div>
              {/* Join input moved below the Quick Actions grid for better UX */}
            </div>

            <div
              className="quick-card"
              style={{ "--qc-glow": "rgba(34,197,94,.1)" }}
              onClick={() => {
                if (recentSessions.length > 0) {
                  navigate(`/session/${recentSessions[0]._id}`);
                } else {
                  navigate("/problems");
                }
              }}
            >
              <div className="quick-card-icon" style={{ background: "linear-gradient(135deg, #059669, #34d399)" }}>
                <HistoryIcon size={20} color="white" />
              </div>
              <div className="quick-card-title">Resume Last</div>
              <div className="quick-card-desc">Continue where you left off in your last session.</div>
            </div>
          </div>

          {/* Join input placed under the Join Session card (aligns to 3rd column) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.25rem" }}>
            <div style={{ gridColumn: 3, justifySelf: "stretch" }}>
              <div className="join-input-row" onClick={(e) => e.stopPropagation()}>
                <input
                  id="join-input"
                  className="join-input"
                  placeholder="Room code..."
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && joinCode.trim()) navigate(`/session/${joinCode.trim()}`);
                  }}
                />
                <button
                  className="btn-primary btn-sm"
                  onClick={() => { if (joinCode.trim()) navigate(`/session/${joinCode.trim()}`); }}
                >
                  <ArrowRightIcon size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* ═══════  STATS OVERVIEW  ═══════ */}
          <div className="section-label anim-3">
            <div className="label-dot" />
            Progress Overview
          </div>
          <div className="stats-grid anim-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "linear-gradient(135deg, rgba(99,102,241,.15), rgba(99,102,241,.05))" }}>
                <TrophyIcon size={20} color="#818cf8" />
              </div>
              <div>
                <div className="stat-num">{stats.problemsSolved}</div>
                <div className="stat-label">Problems Solved</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "linear-gradient(135deg, rgba(56,189,248,.15), rgba(56,189,248,.05))" }}>
                <TerminalIcon size={20} color="#38bdf8" />
              </div>
              <div>
                <div className="stat-num">{stats.totalSubmissions}</div>
                <div className="stat-label">Submissions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "linear-gradient(135deg, rgba(139,92,246,.15), rgba(139,92,246,.05))" }}>
                <UsersIcon size={20} color="#a78bfa" />
              </div>
              <div>
                <div className="stat-num">{activeSessions.length + recentSessions.length}</div>
                <div className="stat-label">Total Sessions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "linear-gradient(135deg, rgba(245,158,11,.15), rgba(245,158,11,.05))" }}>
                <FlameIcon size={20} color="#f59e0b" />
              </div>
              <div>
                <div className="stat-num">{stats.streak} days</div>
                <div className="stat-label">Current Streak</div>
              </div>
            </div>
          </div>

          {/* ═══════  ACTIVITY HEATMAP  ═══════ */}
          <div className="section-label anim-4">
            <div className="label-dot" />
            Activity
          </div>
          <div className="anim-4">
            <Heatmap sessions={[...recentSessions, ...activeSessions]} />
          </div>

          {/* ═══════  SESSIONS (Active + Recent)  ═══════ */}
          <div className="two-col anim-5">
            {/* Active sessions */}
            <div className="card-wrap">
              <div className="card-wrap-header">
                <div className="card-wrap-title">
                  <div className="active-dot" />
                  Live Sessions
                  {activeSessions.length > 0 && (
                    <span style={{
                      fontSize: ".68rem", fontWeight: 700, color: "#22c55e",
                      background: "rgba(34,197,94,.12)", padding: ".15rem .5rem", borderRadius: 6,
                    }}>
                      {activeSessions.length} active
                    </span>
                  )}
                </div>
              </div>
              <div className="card-wrap-body">
                {loadingActiveSessions ? (
                  <div className="empty-state">Loading...</div>
                ) : activeSessions.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <UsersIcon size={22} color="#334155" />
                    </div>
                    No live sessions right now.
                    <br />
                    <button
                      className="btn-primary btn-sm"
                      style={{ marginTop: ".75rem" }}
                      onClick={openCreateModal}
                    >
                      <ZapIcon size={13} /> Create One
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", padding: ".25rem" }}>
                    {activeSessions.slice(0, 5).map((session) => (
                      <div key={session._id} className="session-card">
                        <div className="session-card-info">
                          <div className="session-card-title" title={session.problem}>
                            {session.problem}
                          </div>
                          <div className="session-card-meta">
                            <span><UsersIcon size={11} /> {(session.host ? 1 : 0) + (session.participant ? 1 : 0)}</span>
                            <span><ClockIcon size={11} /> {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => navigate(`/session/${session._id}`)}
                        >
                          {isUserInSession(session) ? "Continue" : "Join"}
                          <ChevronRightIcon size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent sessions */}
            <div className="card-wrap">
              <div className="card-wrap-header">
                <div className="card-wrap-title">
                  <HistoryIcon size={16} color="#64748b" />
                  Recent Sessions
                </div>
              </div>
              <div className="card-wrap-body">
                {loadingRecentSessions ? (
                  <div className="empty-state">Loading...</div>
                ) : recentSessions.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <HistoryIcon size={22} color="#334155" />
                    </div>
                    No recent sessions yet.
                    <br />Start your first coding session!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", padding: ".25rem" }}>
                    {recentSessions.slice(0, 5).map((session) => (
                      <div key={session._id} className="session-card">
                        <div className="session-card-info">
                          <div className="session-card-title" title={session.problem}>
                            {session.problem}
                          </div>
                          <div className="session-card-meta">
                            <span><UsersIcon size={11} /> {(session.host ? 1 : 0) + (session.participant ? 1 : 0)}</span>
                            <span><CalendarIcon size={11} /> {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}</span>
                            <span
                              style={{
                                padding: ".1rem .4rem", borderRadius: 4, fontSize: ".62rem", fontWeight: 700,
                                background: session.status === "active" ? "rgba(34,197,94,.12)" : "rgba(100,116,139,.12)",
                                color: session.status === "active" ? "#22c55e" : "#64748b",
                              }}
                            >
                              {session.status}
                            </span>
                          </div>
                        </div>
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => navigate(`/session/${session._id}`)}
                        >
                          View
                          <ChevronRightIcon size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══════  RECENT PRACTICE PROBLEMS  ═══════ */}
          <div className="section-label anim-6">
            <div className="label-dot" />
            Practice Problems
          </div>
          <div className="card-wrap anim-6" style={{ marginBottom: "2rem" }}>
            <div className="card-wrap-header">
              <div className="card-wrap-title">
                <Code2Icon size={16} color="#64748b" />
                Problems
              </div>
              <Link to="/problems" style={{ textDecoration: "none" }}>
                <button className="btn-secondary btn-sm">
                  View All
                  <ArrowRightIcon size={13} />
                </button>
              </Link>
            </div>
            <div className="card-wrap-body">
              {problems.slice(0, 6).map((problem) => (
                <div
                  key={problem.id}
                  className="problem-row"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/problem/${problem.id}`)}
                >
                  <div className="problem-info">
                    <span
                      className={`diff-badge ${
                        problem.difficulty === "Easy"
                          ? "badge-easy"
                          : problem.difficulty === "Medium"
                          ? "badge-medium"
                          : "badge-hard"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="problem-title">{problem.title}</span>
                    <span style={{ fontSize: ".72rem", color: "#475569" }}>
                      {problem.category}
                    </span>
                  </div>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/problem/${problem.id}`);
                    }}
                  >
                    Solve
                    <ArrowRightIcon size={13} />
                  </button>
                </div>
              ))}
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
