import Editor from "@monaco-editor/react";
import { Loader2Icon, PlayIcon, ChevronDownIcon } from "lucide-react";
import { LANGUAGE_CONFIG } from "../data/problems";

function CodeEditorPanel({
  selectedLanguage,
  code,
  isRunning,
  onLanguageChange,
  onCodeChange,
  onRunCode,
}) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

        .editor-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: #0d0e14;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .lang-selector-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
        }
        .lang-select {
          appearance: none;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: #e2e8f0;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 7px 32px 7px 12px;
          cursor: pointer;
          outline: none;
          transition: all 0.2s;
        }
        .lang-select:hover, .lang-select:focus {
          border-color: rgba(99,102,241,0.4);
          background: rgba(99,102,241,0.06);
        }
        .lang-select option {
          background: #1a1d2e;
        }
        .run-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(34,197,94,0.3);
          transition: all 0.2s ease;
        }
        .run-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(34,197,94,0.45);
        }
        .run-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Editor window chrome */
        .editor-chrome {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #161720;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .chrome-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
      `}</style>

      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0d0e14",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* macOS-style chrome dots */}
        <div className="editor-chrome">
          <div className="chrome-dot" style={{ background: "#ef4444" }} />
          <div className="chrome-dot" style={{ background: "#f59e0b" }} />
          <div className="chrome-dot" style={{ background: "#22c55e" }} />
          <span
            style={{
              marginLeft: 8,
              fontSize: 11,
              color: "#334155",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            solution.{LANGUAGE_CONFIG[selectedLanguage]?.monacoLang || "js"}
          </span>
        </div>

        {/* Toolbar */}
        <div className="editor-toolbar">
          <div className="lang-selector-wrap">
            <img
              src={LANGUAGE_CONFIG[selectedLanguage]?.icon}
              alt={LANGUAGE_CONFIG[selectedLanguage]?.name}
              style={{ width: 22, height: 22, borderRadius: 4 }}
            />
            <div style={{ position: "relative" }}>
              <select className="lang-select" value={selectedLanguage} onChange={onLanguageChange}>
                {Object.entries(LANGUAGE_CONFIG).map(([key, lang]) => (
                  <option key={key} value={key}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                size={13}
                color="#64748b"
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              />
            </div>
          </div>

          <button className="run-btn" disabled={isRunning} onClick={onRunCode}>
            {isRunning ? (
              <>
                <Loader2Icon size={14} style={{ animation: "spin 1s linear infinite" }} />
                Running...
              </>
            ) : (
              <>
                <PlayIcon size={14} />
                Run Code
              </>
            )}
          </button>
        </div>

        {/* Editor */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <Editor
            height="100%"
            language={LANGUAGE_CONFIG[selectedLanguage]?.monacoLang}
            value={code}
            onChange={onCodeChange}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              minimap: { enabled: false },
              padding: { top: 16, bottom: 16 },
              renderLineHighlight: "gutter",
              cursorBlinking: "smooth",
              smoothScrolling: true,
              fontLigatures: true,
              lineHeight: 1.7,
            }}
          />
        </div>
      </div>
    </>
  );
}

export default CodeEditorPanel;