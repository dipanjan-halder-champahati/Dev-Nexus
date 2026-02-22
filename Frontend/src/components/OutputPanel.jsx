import { TerminalIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "lucide-react";

function OutputPanel({ output }) {
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
          padding: 10px 16px;
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
      `}</style>

      <div className="output-panel">
        {/* Header */}
        <div className="output-header">
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: output?.success
                ? "rgba(34,197,94,0.15)"
                : output === null
                ? "rgba(99,102,241,0.15)"
                : "rgba(239,68,68,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            {output === null ? (
              <TerminalIcon size={13} color="#6366f1" />
            ) : output.success ? (
              <CheckCircleIcon size={13} color="#22c55e" />
            ) : (
              <XCircleIcon size={13} color="#ef4444" />
            )}
          </div>

          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: output?.success ? "#22c55e" : output === null ? "#6366f1" : "#ef4444",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: "color 0.2s",
            }}
          >
            {output === null ? "Console" : output.success ? "Passed" : "Error"}
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

        {/* Body */}
        <div className="output-body">
          {output === null ? (
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(34,197,94,0.06)",
                  border: "1px solid rgba(34,197,94,0.15)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginBottom: 14,
                }}
              >
                <CheckCircleIcon size={14} color="#22c55e" />
                <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                  Executed successfully
                </span>
              </div>
              <pre
                style={{
                  fontSize: 13,
                  color: "#86efac",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  margin: 0,
                  lineHeight: 1.7,
                }}
              >
                {output.output}
              </pre>
            </div>
          ) : (
            <div className="output-result">
              {/* Error banner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.15)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginBottom: 14,
                }}
              >
                <XCircleIcon size={14} color="#ef4444" />
                <span style={{ fontSize: 11, color: "#ef4444", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                  Runtime error
                </span>
              </div>

              {output.output && (
                <pre
                  style={{
                    fontSize: 13,
                    color: "#94a3b8",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    margin: "0 0 12px",
                    lineHeight: 1.7,
                  }}
                >
                  {output.output}
                </pre>
              )}
              <pre
                style={{
                  fontSize: 13,
                  color: "#fca5a5",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  margin: 0,
                  lineHeight: 1.7,
                  borderLeft: "2px solid rgba(239,68,68,0.3)",
                  paddingLeft: 12,
                }}
              >
                {output.error}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default OutputPanel;