import { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import {
  Code2Icon,
  LoaderIcon,
  PlusIcon,
  XIcon,
  ChevronDownIcon,
  ZapIcon,
  GlobeIcon,
  LockIcon,
  FlameIcon,
  CheckIcon,
} from "lucide-react";
import { PROBLEMS, LANGUAGE_CONFIG } from "../data/problems";

const difficultyColors = {
  easy: "#22c55e",
  medium: "#f59e0b",
  hard: "#ef4444",
};

function CreateSessionModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onCreateRoom,
  isCreating,
}) {
  const problems = Object.values(PROBLEMS);
  const selectedProblems = (roomConfig.problemList || [])
    .map((pl) => problems.find((p) => p.title === (pl.title || pl)))
    .filter(Boolean);
  const primaryProblem = selectedProblems[0] || null;
  const overlayRef = useRef(null);
  const boxRef = useRef(null);
  const [problemDropdownOpen, setProblemDropdownOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Only close when the true overlay background is clicked (not the modal box)
  const handleOverlayMouseDown = useCallback(
    (e) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  const modalContent = (
    <>
      <style>{`
        .csm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 24px;
          animation: csmOverlayIn 0.22s ease forwards;
        }
        @keyframes csmOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .csm-box {
          background: #0f1117;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          width: 100%;
          max-width: 560px;
          max-height: 88vh;
          overflow-y: auto;
          padding: 36px 32px 32px;
          position: relative;
          animation: csmBoxIn 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
          box-shadow:
            0 0 0 1px rgba(99,102,241,0.12),
            0 24px 64px rgba(0,0,0,0.55),
            0 8px 20px rgba(0,0,0,0.3);
        }
        .csm-box::-webkit-scrollbar { width: 5px; }
        .csm-box::-webkit-scrollbar-track { background: transparent; }
        .csm-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        @keyframes csmBoxIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .csm-close {
          position: absolute;
          top: 18px; right: 18px;
          width: 34px; height: 34px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 2;
        }
        .csm-close:hover {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.3);
          color: #ef4444;
          transform: rotate(90deg);
        }

        .csm-field-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .csm-label-text {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .csm-label-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .csm-select {
          width: 100%;
          padding: 13px 40px 13px 16px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 14px;
          font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
          font-weight: 500;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          transition: all 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }
        .csm-select:hover {
          border-color: rgba(99,102,241,0.35);
          background: rgba(99,102,241,0.04);
        }
        .csm-select:focus {
          border-color: rgba(99,102,241,0.6);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .csm-select option {
          background: #1a1d2e;
          color: #e2e8f0;
          padding: 8px;
        }

        .csm-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 14px;
          font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
          font-weight: 500;
          transition: all 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }
        .csm-input::placeholder { color: #334155; }
        .csm-input:hover {
          border-color: rgba(99,102,241,0.35);
          background: rgba(99,102,241,0.04);
        }
        .csm-input:focus {
          border-color: rgba(99,102,241,0.6);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .csm-create-btn {
          flex: 1;
          padding: 14px 24px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 6px 24px rgba(99,102,241,0.35);
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .csm-create-btn::after {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform .5s;
        }
        .csm-create-btn:hover:not(:disabled)::after { transform: translateX(100%); }
        .csm-create-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(99,102,241,0.5);
        }
        .csm-create-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .csm-create-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .csm-cancel-btn {
          padding: 14px 24px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .csm-cancel-btn:hover {
          background: rgba(255,255,255,0.07);
          color: #94a3b8;
        }

        .csm-vis-toggle {
          display: flex;
          gap: 10px;
        }
        .csm-vis-opt {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .csm-vis-opt:hover {
          border-color: rgba(99,102,241,0.3);
          background: rgba(99,102,241,0.05);
          color: #94a3b8;
        }
        .csm-vis-opt.csm-active {
          background: rgba(99,102,241,0.12);
          border-color: rgba(99,102,241,0.4);
          color: #a5b4fc;
          box-shadow: 0 0 0 1px rgba(99,102,241,0.15);
        }

        .csm-summary {
          background: rgba(99,102,241,0.06);
          border: 1px solid rgba(99,102,241,0.18);
          border-radius: 14px;
          padding: 16px 20px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 14;
          animation: csmSummaryIn 0.25s ease;
        }
        @keyframes csmSummaryIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes csmSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        ref={overlayRef}
        className="csm-overlay"
        onMouseDown={handleOverlayMouseDown}
      >
        <div
          ref={boxRef}
          className="csm-box"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button className="csm-close" onClick={onClose} type="button">
            <XIcon size={15} />
          </button>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
                boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
              }}
            >
              <ZapIcon size={22} color="#fff" />
            </div>
            <h3
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#f1f5f9",
                margin: 0,
                letterSpacing: "-0.03em",
                lineHeight: 1.25,
              }}
            >
              Create Collaborative Session
            </h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "6px 0 0" }}>
              Start a live coding session and invite others to join.
            </p>
          </div>

          {/* ─── Session Name (optional) ─── */}
          <div style={{ marginBottom: 20 }}>
            <div className="csm-field-label">
              <span className="csm-label-text">Session Name</span>
              <span
                className="csm-label-badge"
                style={{ color: "#475569", background: "rgba(255,255,255,0.04)" }}
              >
                Optional
              </span>
            </div>
            <input
              className="csm-input"
              type="text"
              placeholder="e.g. Morning Grind, Interview Prep..."
              value={roomConfig.name || ""}
              onChange={(e) =>
                setRoomConfig((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          {/* ─── Problem selector (multi-select) ─── */}
          <div style={{ marginBottom: 20 }}>
            <div className="csm-field-label">
              <span className="csm-label-text">Select Problems</span>
              <span
                className="csm-label-badge"
                style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)" }}
              >
                Required
              </span>
            </div>

            {/* Selected problem chips */}
            {selectedProblems.length > 0 && (
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 10,
              }}>
                {selectedProblems.map((p, idx) => (
                  <span
                    key={p.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 10px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      background: idx === 0 ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${idx === 0 ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)"}`,
                      color: idx === 0 ? "#a5b4fc" : "#94a3b8",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background:
                          difficultyColors[p.difficulty?.toLowerCase()] || "#94a3b8",
                        flexShrink: 0,
                      }}
                    />
                    {p.title}
                    {idx === 0 && (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        padding: "1px 5px",
                        borderRadius: 3,
                        background: "rgba(34,197,94,0.12)",
                        color: "#34d399",
                        textTransform: "uppercase",
                      }}>
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const newList = (roomConfig.problemList || []).filter(
                          (pl) => (pl.title || pl) !== p.title
                        );
                        const newPrimary = newList[0]
                          ? problems.find((pr) => pr.title === (newList[0].title || newList[0]))
                          : null;
                        setRoomConfig((prev) => ({
                          ...prev,
                          problemList: newList,
                          problem: newPrimary?.title || "",
                          difficulty: newPrimary?.difficulty || "",
                        }));
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#64748b",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                    >
                      <XIcon size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Dropdown toggle */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="csm-select"
                onClick={() => setProblemDropdownOpen(!problemDropdownOpen)}
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  color: selectedProblems.length > 0 ? "#64748b" : "#334155",
                }}
              >
                {selectedProblems.length === 0
                  ? "Choose coding problems..."
                  : `${selectedProblems.length} problem${selectedProblems.length > 1 ? "s" : ""} selected — click to add more`}
              </button>
              <ChevronDownIcon
                size={16}
                color="#64748b"
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: `translateY(-50%) rotate(${problemDropdownOpen ? 180 : 0}deg)`,
                  pointerEvents: "none",
                  transition: "transform 0.2s",
                }}
              />

              {/* Dropdown list */}
              {problemDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    maxHeight: 240,
                    overflowY: "auto",
                    background: "#0f1117",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: 4,
                    zIndex: 20,
                    boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  {problems.map((problem) => {
                    const isSelected = selectedProblems.some((s) => s.id === problem.id);
                    return (
                      <button
                        key={problem.id}
                        type="button"
                        onClick={() => {
                          let newList;
                          if (isSelected) {
                            newList = (roomConfig.problemList || []).filter(
                              (pl) => (pl.title || pl) !== problem.title
                            );
                          } else {
                            newList = [
                              ...(roomConfig.problemList || []),
                              { title: problem.title, difficulty: problem.difficulty.toLowerCase() },
                            ];
                          }
                          const newPrimary = newList[0]
                            ? problems.find((pr) => pr.title === (newList[0].title || newList[0]))
                            : null;
                          setRoomConfig((prev) => ({
                            ...prev,
                            problemList: newList,
                            problem: newPrimary?.title || "",
                            difficulty: newPrimary?.difficulty || "",
                          }));
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          width: "100%",
                          padding: "10px 12px",
                          border: "none",
                          borderRadius: 8,
                          background: isSelected ? "rgba(99,102,241,0.1)" : "transparent",
                          color: isSelected ? "#c7d2fe" : "#94a3b8",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          textAlign: "left",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {/* Checkbox indicator */}
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 5,
                            border: `1.5px solid ${isSelected ? "#6366f1" : "rgba(255,255,255,0.12)"}`,
                            background: isSelected ? "rgba(99,102,241,0.2)" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "all 0.15s",
                          }}
                        >
                          {isSelected && <CheckIcon size={11} color="#a5b4fc" strokeWidth={3} />}
                        </span>
                        {/* Difficulty dot */}
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background:
                              difficultyColors[problem.difficulty?.toLowerCase()] || "#94a3b8",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {problem.title}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color:
                              difficultyColors[problem.difficulty?.toLowerCase()] || "#64748b",
                            textTransform: "capitalize",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {problem.difficulty}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ─── Language + Visibility row ─── */}
          <div style={{ display: "flex", gap: 14, marginBottom: 22 }}>
            {/* Language */}
            <div style={{ flex: 1 }}>
              <div className="csm-field-label">
                <span className="csm-label-text">Language</span>
              </div>
              <div style={{ position: "relative" }}>
                <select
                  className="csm-select"
                  value={roomConfig.language || "javascript"}
                  onChange={(e) =>
                    setRoomConfig((prev) => ({ ...prev, language: e.target.value }))
                  }
                >
                  {Object.entries(LANGUAGE_CONFIG).map(([key, lang]) => (
                    <option key={key} value={key}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  size={16}
                  color="#64748b"
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* Visibility */}
            <div style={{ flex: 1 }}>
              <div className="csm-field-label">
                <span className="csm-label-text">Visibility</span>
              </div>
              <div className="csm-vis-toggle">
                <button
                  className={`csm-vis-opt${(roomConfig.visibility || "private") === "private" ? " csm-active" : ""}`}
                  onClick={() =>
                    setRoomConfig((prev) => ({ ...prev, visibility: "private" }))
                  }
                  type="button"
                >
                  <LockIcon size={13} />
                  Private
                </button>
                <button
                  className={`csm-vis-opt${roomConfig.visibility === "public" ? " csm-active" : ""}`}
                  onClick={() =>
                    setRoomConfig((prev) => ({ ...prev, visibility: "public" }))
                  }
                  type="button"
                >
                  <GlobeIcon size={13} />
                  Public
                </button>
              </div>
            </div>
          </div>

          {/* ─── Room Size (Max Participants) ─── */}
          <div style={{ marginBottom: 22 }}>
            <div className="csm-field-label">
              <span className="csm-label-text">Room Size</span>
              <span
                className="csm-label-badge"
                style={{ color: "#475569", background: "rgba(255,255,255,0.04)" }}
              >
                Max participants
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[2, 3, 5, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`csm-vis-opt${(roomConfig.maxParticipants || 2) === n ? " csm-active" : ""}`}
                  onClick={() =>
                    setRoomConfig((prev) => ({ ...prev, maxParticipants: n }))
                  }
                  style={{ flex: 1, padding: "10px 0", minWidth: 0 }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Summary card ─── */}
          {selectedProblems.length > 0 && (
            <div className="csm-summary" style={{ gap: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Code2Icon size={18} color="#fff" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#e2e8f0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {roomConfig.name || primaryProblem?.title || "Session"}
                  </span>
                  {primaryProblem && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color:
                          difficultyColors[primaryProblem.difficulty?.toLowerCase()] ||
                          "#94a3b8",
                        fontFamily: "'JetBrains Mono', monospace",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        padding: "2px 7px",
                        borderRadius: 5,
                        background:
                          primaryProblem.difficulty?.toLowerCase() === "easy"
                            ? "rgba(34,197,94,0.1)"
                            : primaryProblem.difficulty?.toLowerCase() === "medium"
                            ? "rgba(245,158,11,0.1)"
                            : "rgba(239,68,68,0.1)",
                      }}
                    >
                      {primaryProblem.difficulty}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                  {selectedProblems.length} problem{selectedProblems.length > 1 ? "s" : ""}{" "}
                  · {LANGUAGE_CONFIG[roomConfig.language || "javascript"]?.name || "JavaScript"}{" "}
                  · {(roomConfig.visibility || "private") === "private" ? "Private" : "Public"}{" "}
                  · Max {roomConfig.maxParticipants || 2} participants
                </p>
              </div>
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
              marginBottom: 24,
            }}
          />

          {/* ─── Actions ─── */}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="csm-cancel-btn" onClick={onClose} type="button">
              Cancel
            </button>

            <button
              className="csm-create-btn"
              onClick={onCreateRoom}
              disabled={isCreating || !roomConfig.problem || (roomConfig.problemList || []).length === 0}
              type="button"
            >
              {isCreating ? (
                <>
                  <LoaderIcon
                    size={16}
                    style={{ animation: "csmSpin 1s linear infinite" }}
                  />
                  Creating...
                </>
              ) : (
                <>
                  <FlameIcon size={16} />
                  Create Session
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // Render via portal into document.body so nothing in the parent tree
  // (overflow, z-index context, re-renders) can hide or clip this modal.
  return createPortal(modalContent, document.body);
}

export default CreateSessionModal;