import { useCallback, useState } from "react";
import {
  ChevronDownIcon,
  CrownIcon,
  SettingsIcon,
  UsersIcon,
  Code2Icon,
  ShieldCheckIcon,
  PlusIcon,
  XIcon,
  PlayIcon,
  ListIcon,
} from "lucide-react";
import { PROBLEMS, LANGUAGE_CONFIG } from "../data/problems";
import { sessionApi } from "../api/sessions";
import toast from "react-hot-toast";

/**
 * HostControlPanel — visible to all session members.
 * Host gets full controls; participants see read-only info.
 *
 * Props:
 *  @param {Object}   session        – full session object from backend
 *  @param {boolean}  isHost         – is current user the host?
 *  @param {function} onProblemChange – () => void  — called after a change (typically refetch)
 *  @param {Object}   socketRef      – { current: socket | null }
 */
export default function HostControlPanel({ session, isHost, onProblemChange, socketRef }) {
  const [isChanging, setIsChanging] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const allProblems = Object.values(PROBLEMS);

  const maxP = session?.maxParticipants || 2;
  const participantCount = 1 + (session?.participants?.length || (session?.participant ? 1 : 0));

  // The full problem list for this session
  const problemList = session?.problemList || [{ title: session?.problem, difficulty: session?.difficulty }];
  const activeProblem = session?.problem;

  // Problems not yet in the list (for the "add" dropdown)
  const availableProblems = allProblems.filter(
    (p) => !problemList.some((pl) => pl.title === p.title)
  );

  // Switch active problem
  const handleSwitchProblem = useCallback(
    async (title) => {
      if (!title || title === activeProblem || !isHost) return;
      const sel = problemList.find((p) => p.title === title);
      if (!sel) return;

      setIsChanging(true);
      try {
        await sessionApi.changeProblem(session._id, sel.title, sel.difficulty);
        const socket = socketRef?.current;
        if (socket && session?.callId) {
          socket.emit("problem-change", {
            roomId: session.callId,
            problem: sel.title,
            difficulty: sel.difficulty,
          });
        }
        onProblemChange?.();
        toast.success(`Switched to "${sel.title}"`);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to switch problem");
      } finally {
        setIsChanging(false);
      }
    },
    [session, activeProblem, problemList, socketRef, onProblemChange, isHost],
  );

  // Add a problem to the list
  const handleAddProblem = useCallback(
    async (prob) => {
      if (!isHost) return;
      const newList = [...problemList, { title: prob.title, difficulty: prob.difficulty.toLowerCase() }];
      setIsChanging(true);
      try {
        await sessionApi.updateProblemList(session._id, newList);
        const socket = socketRef?.current;
        if (socket && session?.callId) {
          socket.emit("problemlist-change", { roomId: session.callId, problemList: newList });
        }
        onProblemChange?.();
        setShowAddDropdown(false);
        toast.success(`Added "${prob.title}"`);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to add problem");
      } finally {
        setIsChanging(false);
      }
    },
    [session, problemList, socketRef, onProblemChange, isHost],
  );

  // Remove a problem from the list
  const handleRemoveProblem = useCallback(
    async (title) => {
      if (!isHost) return;
      if (problemList.length <= 1) {
        toast.error("You need at least one problem");
        return;
      }
      const newList = problemList.filter((p) => p.title !== title);
      setIsChanging(true);
      try {
        await sessionApi.updateProblemList(session._id, newList);
        const socket = socketRef?.current;
        if (socket && session?.callId) {
          socket.emit("problemlist-change", { roomId: session.callId, problemList: newList });
        }
        onProblemChange?.();
        toast.success(`Removed "${title}"`);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to remove problem");
      } finally {
        setIsChanging(false);
      }
    },
    [session, problemList, socketRef, onProblemChange, isHost],
  );

  if (!session) return null;

  // Participants for display
  const participantNames = [];
  if (session.host?.name) participantNames.push({ name: session.host.name, isHost: true });
  if (session.participants?.length) {
    for (const p of session.participants) {
      if (p?.name) participantNames.push({ name: p.name, isHost: false });
    }
  } else if (session.participant?.name) {
    participantNames.push({ name: session.participant.name, isHost: false });
  }

  const diffColors = { easy: "#34d399", medium: "#fbbf24", hard: "#f87171" };

  return (
    <>
      <style>{`
        .hcp-panel {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 16px 18px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .hcp-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hcp-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .hcp-host-badge {
          background: rgba(251,191,36,0.12);
          border: 1px solid rgba(251,191,36,0.3);
          color: #fbbf24;
        }
        .hcp-participant-badge {
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.25);
          color: #a5b4fc;
        }
        .hcp-title {
          font-size: 13px;
          font-weight: 800;
          color: #e2e8f0;
          flex: 1;
        }
        .hcp-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .hcp-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .hcp-value {
          font-size: 13px;
          font-weight: 600;
          color: #cbd5e1;
        }
        .hcp-participant-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .hcp-participant-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: #94a3b8;
        }
        .hcp-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
        }
        /* Problem queue */
        .hcp-problem-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .hcp-problem-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          transition: all 0.2s;
          position: relative;
        }
        .hcp-problem-item:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.10);
        }
        .hcp-problem-item.hcp-active-problem {
          background: rgba(99,102,241,0.08);
          border-color: rgba(99,102,241,0.3);
        }
        .hcp-problem-item.hcp-active-problem .hcp-problem-title {
          color: #c7d2fe;
        }
        .hcp-problem-title {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .hcp-diff-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .hcp-switch-btn {
          padding: 3px 8px;
          border-radius: 5px;
          border: 1px solid rgba(99,102,241,0.25);
          background: rgba(99,102,241,0.1);
          color: #a5b4fc;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 3px;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .hcp-switch-btn:hover {
          background: rgba(99,102,241,0.2);
          border-color: rgba(99,102,241,0.4);
        }
        .hcp-switch-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .hcp-remove-btn {
          padding: 2px;
          border-radius: 4px;
          border: 1px solid transparent;
          background: transparent;
          color: #475569;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .hcp-remove-btn:hover {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.25);
          color: #f87171;
        }
        .hcp-add-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 7px 12px;
          border-radius: 8px;
          border: 1px dashed rgba(99,102,241,0.25);
          background: transparent;
          color: #6366f1;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .hcp-add-btn:hover {
          background: rgba(99,102,241,0.06);
          border-color: rgba(99,102,241,0.4);
        }
        .hcp-add-dropdown {
          margin-top: 6px;
          max-height: 180px;
          overflow-y: auto;
          background: #13141e;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 4px;
        }
        .hcp-add-dropdown::-webkit-scrollbar { width: 4px; }
        .hcp-add-dropdown::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .hcp-add-option {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 10px;
          border: none;
          border-radius: 7px;
          background: transparent;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          transition: all 0.15s;
        }
        .hcp-add-option:hover {
          background: rgba(99,102,241,0.1);
          color: #c7d2fe;
        }
        .hcp-count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          background: rgba(99,102,241,0.15);
          color: #a5b4fc;
          padding: 0 5px;
        }
        .hcp-active-badge {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.25);
          color: #34d399;
          text-transform: uppercase;
          flex-shrink: 0;
        }
      `}</style>

      <div className="hcp-panel">
        {/* Header */}
        <div className="hcp-header">
          <SettingsIcon size={14} color="#64748b" />
          <span className="hcp-title">
            {isHost ? "Host Controls" : "Session Info"}
          </span>
          <span className={`hcp-badge ${isHost ? "hcp-host-badge" : "hcp-participant-badge"}`}>
            {isHost ? <><CrownIcon size={10} /> Host</> : <><ShieldCheckIcon size={10} /> Participant</>}
          </span>
        </div>

        <div className="hcp-divider" />

        {/* Problem Queue */}
        <div>
          <div className="hcp-row" style={{ marginBottom: 8 }}>
            <span className="hcp-label">
              <ListIcon size={11} /> Problems
            </span>
            <span className="hcp-count-badge">{problemList.length}</span>
          </div>

          <div className="hcp-problem-list">
            {problemList.map((p, idx) => {
              const isActive = p.title === activeProblem;
              return (
                <div
                  key={p.title + idx}
                  className={`hcp-problem-item${isActive ? " hcp-active-problem" : ""}`}
                >
                  <span
                    className="hcp-diff-dot"
                    style={{ background: diffColors[p.difficulty] || "#64748b" }}
                  />
                  <span className="hcp-problem-title" title={p.title}>
                    {p.title}
                  </span>
                  {isActive && <span className="hcp-active-badge">Active</span>}
                  {!isActive && isHost && (
                    <button
                      className="hcp-switch-btn"
                      onClick={() => handleSwitchProblem(p.title)}
                      disabled={isChanging}
                      title="Switch to this problem"
                    >
                      <PlayIcon size={9} /> Switch
                    </button>
                  )}
                  {isHost && problemList.length > 1 && (
                    <button
                      className="hcp-remove-btn"
                      onClick={() => handleRemoveProblem(p.title)}
                      disabled={isChanging}
                      title="Remove problem"
                    >
                      <XIcon size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add problem button (host only) */}
          {isHost && availableProblems.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <button
                className="hcp-add-btn"
                onClick={() => setShowAddDropdown(!showAddDropdown)}
                type="button"
              >
                <PlusIcon size={12} />
                Add Problem
              </button>

              {showAddDropdown && (
                <div className="hcp-add-dropdown">
                  {availableProblems.map((p) => (
                    <button
                      key={p.id}
                      className="hcp-add-option"
                      onClick={() => handleAddProblem(p)}
                    >
                      <span
                        className="hcp-diff-dot"
                        style={{ background: diffColors[p.difficulty?.toLowerCase()] || "#64748b" }}
                      />
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.title}
                      </span>
                      <span style={{ fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "capitalize" }}>
                        {p.difficulty}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hcp-divider" />

        {/* Room size */}
        <div className="hcp-row">
          <span className="hcp-label">
            <UsersIcon size={11} /> Room Size
          </span>
          <span
            className="hcp-value"
            style={{
              color: participantCount >= maxP ? "#f87171" : "#34d399",
            }}
          >
            {participantCount}/{maxP}
            {participantCount >= maxP && (
              <span style={{ marginLeft: 6, fontSize: 10, color: "#f87171", fontWeight: 700 }}>
                FULL
              </span>
            )}
          </span>
        </div>

        {/* Participants */}
        {participantNames.length > 0 && (
          <>
            <div className="hcp-divider" />
            <div>
              <span className="hcp-label" style={{ marginBottom: 8, display: "flex" }}>
                Participants
              </span>
              <div className="hcp-participant-list">
                {participantNames.map((p, i) => (
                  <span key={i} className="hcp-participant-chip">
                    {p.isHost && <CrownIcon size={10} color="#fbbf24" />}
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
