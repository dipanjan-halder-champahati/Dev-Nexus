import { ChevronDownIcon, TagIcon, AlignLeftIcon, FlaskConicalIcon, ShieldIcon } from "lucide-react";

const difficultyConfig = {
  easy: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  hard: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
};

function Section({ icon: Icon, title, children, delay = 0 }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14,
        overflow: "hidden",
        animation: `sectionIn 0.4s ease ${delay}s both`,
      }}
    >
      <style>{`@keyframes sectionIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <Icon size={14} color="#6366f1" />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}

function ProblemDescription({ problem, currentProblemId, onProblemChange, allProblems }) {
  const diff = difficultyConfig[problem.difficulty?.toLowerCase()] || difficultyConfig.easy;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');

        .prob-desc {
          height: 100%;
          overflow-y: auto;
          background: #0a0b10;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .prob-desc::-webkit-scrollbar { width: 4px; }
        .prob-desc::-webkit-scrollbar-track { background: transparent; }
        .prob-desc::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

        .prob-select {
          width: 100%;
          appearance: none;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #e2e8f0;
          font-size: 13px;
          font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 9px 36px 9px 14px;
          cursor: pointer;
          outline: none;
          transition: all 0.2s;
        }
        .prob-select:hover, .prob-select:focus {
          border-color: rgba(99,102,241,0.4);
          background: rgba(99,102,241,0.04);
        }
        .prob-select option { background: #1a1d2e; }

        .example-block {
          background: #0d0e14;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px;
          padding: 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px;
          line-height: 1.7;
        }
        .io-label {
          font-weight: 700;
          min-width: 64px;
          display: inline-block;
        }
        .constraint-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .constraint-item:last-child { border-bottom: none; }
      `}</style>

      <div className="prob-desc">
        {/* Header */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "#0d0e14",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#f1f5f9",
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              {problem.title}
            </h1>
            <span
              style={{
                background: diff.bg,
                border: `1px solid ${diff.border}`,
                color: diff.color,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "3px 10px",
                borderRadius: 4,
                textTransform: "uppercase",
                fontFamily: "'JetBrains Mono', monospace",
                flexShrink: 0,
                marginTop: 4,
              }}
            >
              {problem.difficulty}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <TagIcon size={11} color="#6366f1" />
            <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
              {problem.category}
            </span>
          </div>

          {/* Problem switcher */}
          <div style={{ position: "relative" }}>
            <select
              className="prob-select"
              value={currentProblemId}
              onChange={(e) => onProblemChange(e.target.value)}
            >
              {allProblems.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.difficulty}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              size={13}
              color="#64748b"
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Description */}
          <Section icon={AlignLeftIcon} title="Description" delay={0}>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 10px", lineHeight: 1.75 }}>
              {problem.description.text}
            </p>
            {problem.description.notes?.map((note, idx) => (
              <p key={idx} style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 6px", lineHeight: 1.75 }}>
                {note}
              </p>
            ))}
          </Section>

          {/* Examples */}
          <Section icon={FlaskConicalIcon} title="Examples" delay={0.08}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {problem.examples.map((example, idx) => (
                <div key={idx}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#6366f1",
                        background: "rgba(99,102,241,0.1)",
                        border: "1px solid rgba(99,102,241,0.2)",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: "0.06em",
                      }}
                    >
                      EX {idx + 1}
                    </span>
                  </div>
                  <div className="example-block">
                    <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                      <span className="io-label" style={{ color: "#818cf8" }}>Input:</span>
                      <span style={{ color: "#e2e8f0" }}>{example.input}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: example.explanation ? 8 : 0 }}>
                      <span className="io-label" style={{ color: "#34d399" }}>Output:</span>
                      <span style={{ color: "#e2e8f0" }}>{example.output}</span>
                    </div>
                    {example.explanation && (
                      <div
                        style={{
                          paddingTop: 10,
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                          fontSize: 12,
                          color: "#64748b",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          lineHeight: 1.6,
                        }}
                      >
                        <strong style={{ color: "#475569" }}>Explanation:</strong>{" "}
                        {example.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Constraints */}
          <Section icon={ShieldIcon} title="Constraints" delay={0.14}>
            <div>
              {problem.constraints.map((constraint, idx) => (
                <div key={idx} className="constraint-item">
                  <span style={{ color: "#6366f1", marginTop: 1, fontSize: 14 }}>•</span>
                  <code
                    style={{
                      fontSize: 12.5,
                      color: "#94a3b8",
                      fontFamily: "'JetBrains Mono', monospace",
                      lineHeight: 1.6,
                    }}
                  >
                    {constraint}
                  </code>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

export default ProblemDescription;