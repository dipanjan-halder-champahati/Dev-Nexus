import { Code2Icon, LoaderIcon, PlusIcon, XIcon, ChevronDownIcon, ZapIcon } from "lucide-react";
import { PROBLEMS } from "../data/problems";

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
  const selectedProblem = problems.find((p) => p.title === roomConfig.problem);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 24px;
          animation: overlayIn 0.2s ease;
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal-box {
          background: #0f1117;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          width: 100%;
          max-width: 520px;
          padding: 32px;
          position: relative;
          animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1);
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .modal-close:hover {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.3);
          color: #ef4444;
        }
        .custom-select {
          width: 100%;
          padding: 12px 40px 12px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
          appearance: none;
          transition: all 0.2s ease;
          outline: none;
        }
        .custom-select:hover {
          border-color: rgba(99,102,241,0.35);
          background: rgba(99,102,241,0.05);
        }
        .custom-select:focus {
          border-color: rgba(99,102,241,0.6);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .custom-select option {
          background: #1a1d2e;
          color: #e2e8f0;
        }
        .create-btn-modal {
          flex: 1;
          padding: 13px 24px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 6px 20px rgba(99,102,241,0.35);
          transition: all 0.2s ease;
        }
        .create-btn-modal:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 30px rgba(99,102,241,0.5);
        }
        .create-btn-modal:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .cancel-btn {
          padding: 13px 24px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cancel-btn:hover {
          background: rgba(255,255,255,0.07);
          color: #94a3b8;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          {/* Close */}
          <button className="modal-close" onClick={onClose}>
            <XIcon size={15} />
          </button>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
              }}
            >
              <ZapIcon size={20} color="#fff" />
            </div>
            <h3
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#f1f5f9",
                margin: 0,
                letterSpacing: "-0.03em",
              }}
            >
              New Session
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4, margin: "4px 0 0" }}>
              Pick a problem and challenge a peer
            </p>
          </div>

          {/* Problem selector */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Problem
              </span>
              <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 600 }}>Required</span>
            </label>

            <div style={{ position: "relative" }}>
              <select
                className="custom-select"
                value={roomConfig.problem}
                onChange={(e) => {
                  const sel = problems.find((p) => p.title === e.target.value);
                  setRoomConfig({ difficulty: sel?.difficulty || "", problem: e.target.value });
                }}
              >
                <option value="" disabled>
                  Choose a coding problem...
                </option>
                {problems.map((problem) => (
                  <option key={problem.id} value={problem.title}>
                    {problem.title} · {problem.difficulty}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                size={16}
                color="#64748b"
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              />
            </div>
          </div>

          {/* Summary card */}
          {selectedProblem && (
            <div
              style={{
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 28,
                display: "flex",
                alignItems: "center",
                gap: 14,
                animation: "summaryIn 0.2s ease",
              }}
            >
              <style>{`@keyframes summaryIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Code2Icon size={18} color="#fff" />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
                    {selectedProblem.title}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: difficultyColors[selectedProblem.difficulty?.toLowerCase()] || "#94a3b8",
                      fontFamily: "'JetBrains Mono', monospace",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {selectedProblem.difficulty}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                  1-on-1 session · Max 2 participants
                </p>
              </div>
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.05)",
              marginBottom: 24,
            }}
          />

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button
              className="create-btn-modal"
              onClick={onCreateRoom}
              disabled={isCreating || !roomConfig.problem}
            >
              {isCreating ? (
                <>
                  <LoaderIcon size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon size={16} />
                  Create Session
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateSessionModal;