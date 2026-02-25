import { useRef, useEffect, useState } from "react";
import { TerminalIcon, CheckCircleIcon, XCircleIcon, ClockIcon, AlertCircleIcon, BrainCircuitIcon } from "lucide-react";

function OutputPanel({ output, aiReview }) {
  const bodyRef = useRef(null);
  const [activeTab, setActiveTab] = useState("output");

  // Auto-switch to review tab when AI review arrives
  useEffect(() => {
    if (aiReview) setActiveTab("review");
  }, [aiReview]);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [output]);

  // Determine status type from error message
  const getStatusInfo = () => {
    if (!output || output.success) {
      return { type: "accepted", label: "Accepted", icon: "check" };
    }

    const error = (output.error || "").toLowerCase();
    if (error.includes("compilation") || error.includes("syntax")) {
      return { type: "compilation", label: "Compilation Error", icon: "alert" };
    }
    if (error.includes("time limit")) {
      return { type: "timeout", label: "Time Limit Exceeded", icon: "clock" };
    }
    if (error.includes("runtime") || error.includes("exception")) {
      return { type: "runtime", label: "Runtime Error", icon: "error" };
    }
    
    return { type: "error", label: "Error", icon: "error" };
  };

  const status = getStatusInfo();
  const colorMap = {
    accepted: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", text: "#22c55e", icon: CheckCircleIcon },
    compilation: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", text: "#ef4444", icon: XCircleIcon },
    runtime: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", text: "#ef4444", icon: XCircleIcon },
    timeout: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", text: "#f59e0b", icon: ClockIcon },
    error: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", text: "#ef4444", icon: XCircleIcon },
  };
  const colors = colorMap[status.type];
  const StatusIcon = colors.icon;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap');

        .output-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #0a0b10;
          font-family: 'JetBrains Mono', monospace;
        }
        .output-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #0d0e14;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .output-body {
          flex: 1;
          overflow: auto;
          padding: 16px;
        }
        .output-body::-webkit-scrollbar {
          width: 4px;
        }
        .output-body::-webkit-scrollbar-track {
          background: transparent;
        }
        .output-body::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
        }
        .prompt-line::before {
          content: '$ ';
          color: #6366f1;
          font-weight: 700;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .output-result {
          animation: fadeIn 0.3s ease;
        }
        .status-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
          border: 1px solid;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600;
          font-size: 12px;
        }
        .output-section {
          margin-bottom: 16px;
        }
        .section-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .output-content {
          font-size: 13px;
          whiteSpace: pre-wrap;
          word-break: break-word;
          line-height: 1.6;
          border-radius: 6px;
          padding: 12px;
          background: rgba(15,23,42,0.5);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .output-tabs {
          display: flex;
          gap: 2px;
          padding: 0 16px;
          background: #0d0e14;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .output-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #475569;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .output-tab:hover {
          color: #94a3b8;
        }
        .output-tab-active {
          color: #e2e8f0;
          border-bottom-color: #6366f1;
        }
        .ai-review-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 4px;
        }
        .ai-review-card {
          background: rgba(15,23,42,0.5);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          padding: 14px;
        }
        .ai-review-card-title {
          font-size: 12px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #94a3b8;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .ai-review-card-body {
          font-size: 13px;
          color: #cbd5e1;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }
      `}</style>

      <div className="output-panel">
        {/* Header */}
        <div className="output-header">
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: output === null ? "rgba(99,102,241,0.15)" : colors.bg,
              border: output === null ? "1px solid rgba(99,102,241,0.2)" : `1px solid ${colors.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            {output === null ? (
              <TerminalIcon size={14} color="#6366f1" strokeWidth={2} />
            ) : (
              <StatusIcon size={14} color={colors.text} strokeWidth={2} />
            )}
          </div>

          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: output === null ? "#6366f1" : colors.text,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: "color 0.2s",
            }}
          >
            {output === null ? "Console Output" : status.label}
          </span>

          <div style={{ flex: 1 }} />

          {output !== null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: "#475569",
                fontSize: 10,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              <ClockIcon size={10} />
              <span>Just now</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="output-tabs">
          <button
            className={`output-tab ${activeTab === "output" ? "output-tab-active" : ""}`}
            onClick={() => setActiveTab("output")}
          >
            <TerminalIcon size={13} />
            Output
          </button>
          {aiReview && (
            <button
              className={`output-tab ${activeTab === "review" ? "output-tab-active" : ""}`}
              onClick={() => setActiveTab("review")}
            >
              <BrainCircuitIcon size={13} />
              AI Review
            </button>
          )}
        </div>

        {/* Body */}
        <div className="output-body" ref={bodyRef}>
          {activeTab === "review" && aiReview ? (
            <div className="ai-review-grid">
              {aiReview.explanation && (
                <div className="ai-review-card">
                  <div className="ai-review-card-title">Code Review</div>
                  <div className="ai-review-card-body">{aiReview.explanation}</div>
                </div>
              )}
              {aiReview.optimization && (
                <div className="ai-review-card">
                  <div className="ai-review-card-title">Optimization Suggestions</div>
                  <div className="ai-review-card-body">{aiReview.optimization}</div>
                </div>
              )}
              {(aiReview.timeComplexity || aiReview.spaceComplexity) && (
                <div className="ai-review-card">
                  <div className="ai-review-card-title">Complexity Analysis</div>
                  <div className="ai-review-card-body">
                    {aiReview.timeComplexity && <div><strong>Time Complexity:</strong> {aiReview.timeComplexity}</div>}
                    {aiReview.spaceComplexity && <div style={{ marginTop: 4 }}><strong>Space Complexity:</strong> {aiReview.spaceComplexity}</div>}
                  </div>
                </div>
              )}
            </div>
          ) : output === null ? (
            <div style={{ color: "#334155", fontSize: 12 }}>
              <div className="prompt-line" style={{ color: "#475569", marginBottom: 12 }}>
                Run your code to see output here
              </div>
              <div style={{ borderLeft: "2px solid rgba(99,102,241,0.2)", paddingLeft: 12, marginTop: 16 }}>
                <p style={{ color: "#1e293b", fontSize: 11, lineHeight: 1.7, margin: 0 }}>
                  Tip: Use Ctrl+Enter to run code quickly
                </p>
              </div>
            </div>
          ) : output.success ? (
            <div className="output-result">
              {/* Success banner */}
              <div
                className="status-banner"
                style={{
                  background: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                <StatusIcon size={16} strokeWidth={2} />
                <span>Code Accepted</span>
              </div>

              {/* Output section */}
              <div className="output-section">
                <div className="section-label">Output</div>
                <div className="output-content" style={{ color: "#86efac" }}>
                  {output.output && output.output !== "No output"
                    ? output.output
                    : "Code executed successfully with no output"}
                </div>
              </div>
            </div>
          ) : (
            <div className="output-result">
              {/* Error banner */}
              <div
                className="status-banner"
                style={{
                  background: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                <StatusIcon size={16} strokeWidth={2} />
                <span>{status.label}</span>
              </div>

              {/* Output section (if any) */}
              {output.output && output.output.trim() && (
                <div className="output-section">
                  <div className="section-label">Program Output</div>
                  <div className="output-content" style={{ color: "#cbd5e1" }}>
                    {output.output}
                  </div>
                </div>
              )}

              {/* Error section */}
              {output.error && (
                <div className="output-section">
                  <div className="section-label">{status.type === "compilation" ? "Compilation Error" : "Error Message"}</div>
                  <div
                    className="output-content"
                    style={{
                      color: colors.text,
                      background: `${colors.bg}`,
                      borderColor: colors.border,
                    }}
                  >
                    {output.error}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default OutputPanel;