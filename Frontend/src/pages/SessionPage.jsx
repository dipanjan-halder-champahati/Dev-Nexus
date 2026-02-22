import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import { Loader2Icon, LogOutIcon, PhoneOffIcon, UsersIcon, TagIcon, UserIcon } from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";

import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";

/* ─────────────── Difficulty colour map ─────────────── */
const DIFF_STYLES = {
  easy:   { color: "#34d399", bg: "rgba(52,211,153,.12)",  border: "rgba(52,211,153,.28)"  },
  medium: { color: "#fbbf24", bg: "rgba(251,191,36,.12)",  border: "rgba(251,191,36,.28)"  },
  hard:   { color: "#f87171", bg: "rgba(248,113,113,.12)", border: "rgba(248,113,113,.28)" },
};

function DiffBadge({ difficulty }) {
  const key = (difficulty ?? "easy").toLowerCase();
  const s   = DIFF_STYLES[key] ?? DIFF_STYLES.easy;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center",
        padding: ".22rem .75rem",
        borderRadius: 999,
        fontSize: ".72rem", fontWeight: 700, letterSpacing: ".06em",
        color: s.color, background: s.bg, border: `1px solid ${s.border}`,
      }}
    >
      {key.charAt(0).toUpperCase() + key.slice(1)}
    </span>
  );
}

function SessionPage() {
  const navigate   = useNavigate();
  const { id }     = useParams();
  const { user }   = useUser();
  const [output,    setOutput]    = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const { data: sessionData, isLoading: loadingSession, refetch } = useSessionById(id);
  const joinSessionMutation = useJoinSession();
  const endSessionMutation  = useEndSession();

  const session       = sessionData?.session;
  const isHost        = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;

  const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
    session, loadingSession, isHost, isParticipant
  );

  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(problemData?.starterCode?.[selectedLanguage] || "");

  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;
    joinSessionMutation.mutate(id, { onSuccess: refetch });
  }, [session, user, loadingSession, isHost, isParticipant, id]);

  useEffect(() => {
    if (!session || loadingSession) return;
    if (session.status === "completed") navigate("/dashboard");
  }, [session, loadingSession, navigate]);

  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage]) {
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(problemData?.starterCode?.[newLang] || "");
    setOutput(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session? All participants will be notified.")) {
      endSessionMutation.mutate(id, { onSuccess: () => navigate("/dashboard") });
    }
  };

  return (
    <>
      <style>{`
        /* ── Root ── */
        .session-root {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0d0e14;
          color: #e8eaf0;
        }

        /* ── Panel resize handles ── */
        .rh-col {
          width: 4px;
          background: rgba(255,255,255,.05);
          cursor: col-resize;
          transition: background .15s;
        }
        .rh-col:hover, .rh-col:active { background: rgba(108,79,246,.65); }

        .rh-row {
          height: 4px;
          background: rgba(255,255,255,.05);
          cursor: row-resize;
          transition: background .15s;
        }
        .rh-row:hover, .rh-row:active { background: rgba(108,79,246,.65); }

        /* ── Problem description pane ── */
        .prob-pane {
          height: 100%;
          overflow-y: auto;
          background: #10111a;
          display: flex;
          flex-direction: column;
        }
        .prob-pane::-webkit-scrollbar { width: 4px; }
        .prob-pane::-webkit-scrollbar-track { background: transparent; }
        .prob-pane::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 2px; }

        /* Header */
        .prob-header {
          padding: 1.4rem 1.6rem 1.2rem;
          background: #0d0e14;
          border-bottom: 1px solid rgba(255,255,255,.06);
          flex-shrink: 0;
        }
        .prob-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: #e8eaf0;
          margin: 0 0 .35rem;
          line-height: 1.2;
        }
        .prob-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: .5rem .8rem;
          font-size: .78rem;
          color: rgba(232,234,240,.4);
        }
        .prob-meta-item {
          display: inline-flex; align-items: center; gap: .3rem;
        }

        /* Header action row */
        .prob-header-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: .6rem;
        }
        .prob-badges { display: flex; align-items: center; gap: .5rem; flex-shrink: 0; }

        /* End session button */
        .end-btn {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .45rem 1rem;
          background: rgba(248,113,113,.12);
          border: 1px solid rgba(248,113,113,.3);
          border-radius: 8px;
          color: #f87171;
          font-size: .8rem;
          font-weight: 700;
          cursor: pointer;
          transition: background .18s, border-color .18s, transform .18s;
        }
        .end-btn:hover:not(:disabled) {
          background: rgba(248,113,113,.2);
          border-color: rgba(248,113,113,.5);
          transform: translateY(-1px);
        }
        .end-btn:disabled { opacity: .5; cursor: not-allowed; }

        /* Completed badge */
        .completed-badge {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .3rem .85rem;
          border-radius: 999px;
          font-size: .72rem; font-weight: 700;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          color: rgba(232,234,240,.5);
        }

        /* ── Content blocks ── */
        .prob-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1.1rem; }

        .content-block {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px;
          overflow: hidden;
        }
        .content-block-header {
          padding: .7rem 1.1rem;
          background: rgba(255,255,255,.03);
          border-bottom: 1px solid rgba(255,255,255,.06);
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: rgba(232,234,240,.35);
        }
        .content-block-body { padding: 1rem 1.1rem; }

        /* Description text */
        .desc-text {
          font-size: .9rem;
          line-height: 1.75;
          color: rgba(232,234,240,.75);
        }

        /* Example card */
        .example-card {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 10px;
          overflow: hidden;
          margin-top: .6rem;
        }
        .example-card + .example-card { margin-top: .75rem; }
        .example-label {
          padding: .45rem .85rem;
          font-size: .68rem; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase;
          color: rgba(232,234,240,.3);
          border-bottom: 1px solid rgba(255,255,255,.06);
          background: rgba(255,255,255,.02);
          display: flex; align-items: center; gap: .5rem;
        }
        .example-num {
          width: 18px; height: 18px;
          background: rgba(108,79,246,.2);
          border-radius: 4px;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: .65rem; color: #a78bfa; font-weight: 800;
        }
        .example-io { padding: .75rem .85rem; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: .8rem; }
        .io-row { display: flex; gap: .6rem; margin-bottom: .4rem; }
        .io-row:last-child { margin-bottom: 0; }
        .io-key {
          min-width: 60px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .io-key.input  { color: #a78bfa; }
        .io-key.output { color: #38bdf8; }
        .io-val { color: rgba(232,234,240,.7); }
        .io-explanation {
          margin-top: .6rem;
          padding-top: .6rem;
          border-top: 1px solid rgba(255,255,255,.06);
          font-size: .75rem;
          color: rgba(232,234,240,.4);
          font-family: 'DM Sans', sans-serif;
          line-height: 1.6;
        }

        /* Constraints list */
        .constraint-item {
          display: flex; align-items: flex-start; gap: .6rem;
          margin-bottom: .5rem;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: .8rem;
          color: rgba(232,234,240,.65);
        }
        .constraint-item:last-child { margin-bottom: 0; }
        .constraint-bullet {
          width: 6px; height: 6px; border-radius: 50%;
          background: #6c4ff6;
          flex-shrink: 0; margin-top: .35rem;
        }

        /* ── Video panel ── */
        .video-panel-wrap {
          height: 100%;
          background: #0a0b10;
          padding: 1rem;
          overflow: auto;
        }

        /* Connecting / error states */
        .call-state-wrap {
          height: 100%;
          display: flex; align-items: center; justify-content: center;
        }
        .call-state-card {
          text-align: center;
          padding: 2.5rem 2rem;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 20px;
          max-width: 340px;
          width: 100%;
        }
        .call-icon-wrap {
          width: 72px; height: 72px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.25rem;
        }
        .call-state-title {
          font-size: 1.2rem; font-weight: 800;
          color: #e8eaf0; margin-bottom: .5rem;
        }
        .call-state-sub { font-size: .85rem; color: rgba(232,234,240,.4); }

        /* Spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>

      <div className="session-root">
        <Navbar />

        <div style={{ flex: 1, overflow: "hidden" }}>
          <PanelGroup direction="horizontal">

            {/* ── LEFT PANEL ── */}
            <Panel defaultSize={50} minSize={30}>
              <PanelGroup direction="vertical">

                {/* Problem description */}
                <Panel defaultSize={50} minSize={20}>
                  <div className="prob-pane">
                    {/* Header */}
                    <div className="prob-header">
                      <div className="prob-header-top">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h1 className="prob-title">{session?.problem || "Loading..."}</h1>
                        </div>
                        <div className="prob-badges">
                          {session?.difficulty && <DiffBadge difficulty={session.difficulty} />}
                          {isHost && session?.status === "active" && (
                            <button
                              onClick={handleEndSession}
                              disabled={endSessionMutation.isPending}
                              className="end-btn"
                            >
                              {endSessionMutation.isPending
                                ? <Loader2Icon size={14} className="spin" />
                                : <LogOutIcon size={14} />
                              }
                              End
                            </button>
                          )}
                          {session?.status === "completed" && (
                            <span className="completed-badge">Completed</span>
                          )}
                        </div>
                      </div>

                      <div className="prob-meta">
                        {problemData?.category && (
                          <span className="prob-meta-item">
                            <TagIcon size={11} />
                            {problemData.category}
                          </span>
                        )}
                        <span className="prob-meta-item">
                          <UserIcon size={11} />
                          Host: {session?.host?.name || "—"}
                        </span>
                        <span className="prob-meta-item">
                          <UsersIcon size={11} />
                          {session?.participant ? 2 : 1}/2 participants
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="prob-body">
                      {/* Description */}
                      {problemData?.description && (
                        <div className="content-block">
                          <div className="content-block-header">Description</div>
                          <div className="content-block-body">
                            <p className="desc-text">{problemData.description.text}</p>
                            {problemData.description.notes?.map((note, i) => (
                              <p key={i} className="desc-text" style={{ marginTop: ".75rem" }}>{note}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Examples */}
                      {problemData?.examples?.length > 0 && (
                        <div className="content-block">
                          <div className="content-block-header">Examples</div>
                          <div className="content-block-body" style={{ paddingTop: ".5rem" }}>
                            {problemData.examples.map((ex, i) => (
                              <div key={i} className="example-card">
                                <div className="example-label">
                                  <span className="example-num">{i + 1}</span>
                                  Example {i + 1}
                                </div>
                                <div className="example-io">
                                  <div className="io-row">
                                    <span className="io-key input">Input:</span>
                                    <span className="io-val">{ex.input}</span>
                                  </div>
                                  <div className="io-row">
                                    <span className="io-key output">Output:</span>
                                    <span className="io-val">{ex.output}</span>
                                  </div>
                                  {ex.explanation && (
                                    <div className="io-explanation">
                                      <strong>Explanation:</strong> {ex.explanation}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Constraints */}
                      {problemData?.constraints?.length > 0 && (
                        <div className="content-block">
                          <div className="content-block-header">Constraints</div>
                          <div className="content-block-body">
                            {problemData.constraints.map((c, i) => (
                              <div key={i} className="constraint-item">
                                <span className="constraint-bullet" />
                                <code>{c}</code>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Panel>

                <PanelResizeHandle className="rh-row" />

                {/* Editor + Output */}
                <Panel defaultSize={50} minSize={20}>
                  <PanelGroup direction="vertical">
                    <Panel defaultSize={70} minSize={30}>
                      <CodeEditorPanel
                        selectedLanguage={selectedLanguage}
                        code={code}
                        isRunning={isRunning}
                        onLanguageChange={handleLanguageChange}
                        onCodeChange={(v) => setCode(v)}
                        onRunCode={handleRunCode}
                      />
                    </Panel>

                    <PanelResizeHandle className="rh-row" />

                    <Panel defaultSize={30} minSize={15}>
                      <OutputPanel output={output} />
                    </Panel>
                  </PanelGroup>
                </Panel>
              </PanelGroup>
            </Panel>

            <PanelResizeHandle className="rh-col" />

            {/* ── RIGHT PANEL: Video & Chat ── */}
            <Panel defaultSize={50} minSize={28}>
              <div className="video-panel-wrap">
                {isInitializingCall ? (
                  <div className="call-state-wrap">
                    <div className="call-state-card">
                      <div
                        className="call-icon-wrap"
                        style={{ background: "rgba(108,79,246,.15)" }}
                      >
                        <Loader2Icon size={32} color="#a78bfa" className="spin" />
                      </div>
                      <div className="call-state-title">Connecting…</div>
                      <div className="call-state-sub">Setting up your video call session</div>
                    </div>
                  </div>
                ) : !streamClient || !call ? (
                  <div className="call-state-wrap">
                    <div className="call-state-card">
                      <div
                        className="call-icon-wrap"
                        style={{ background: "rgba(248,113,113,.12)" }}
                      >
                        <PhoneOffIcon size={32} color="#f87171" />
                      </div>
                      <div className="call-state-title">Connection Failed</div>
                      <div className="call-state-sub">Unable to connect to the video call. Please try refreshing.</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ height: "100%" }}>
                    <StreamVideo client={streamClient}>
                      <StreamCall call={call}>
                        <VideoCallUI chatClient={chatClient} channel={channel} />
                      </StreamCall>
                    </StreamVideo>
                  </div>
                )}
              </div>
            </Panel>

          </PanelGroup>
        </div>
      </div>
    </>
  );
}

export default SessionPage;