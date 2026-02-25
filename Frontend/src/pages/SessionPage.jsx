import { useUser } from "@clerk/clerk-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  useEndSession,
  useJoinSession,
  useSessionById,
} from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import { sessionApi } from "../api/sessions";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import {
  Loader2Icon,
  LogOutIcon,
  PhoneOffIcon,
  UsersIcon,
  TagIcon,
  UserIcon,
  CopyIcon,
  CheckIcon,
  LinkIcon,
  FileTextIcon,
  BookOpenIcon,
} from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import NotesPanel from "../components/NotesPanel";
import toast from "react-hot-toast";

import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";
import useSocket from "../hooks/useSocket";

/* ─────────────── Difficulty colour map ─────────────── */
const DIFF_STYLES = {
  easy: {
    color: "#34d399",
    bg: "rgba(52,211,153,.12)",
    border: "rgba(52,211,153,.28)",
  },
  medium: {
    color: "#fbbf24",
    bg: "rgba(251,191,36,.12)",
    border: "rgba(251,191,36,.28)",
  },
  hard: {
    color: "#f87171",
    bg: "rgba(248,113,113,.12)",
    border: "rgba(248,113,113,.28)",
  },
};

function DiffBadge({ difficulty }) {
  const key = (difficulty ?? "easy").toLowerCase();
  const s = DIFF_STYLES[key] ?? DIFF_STYLES.easy;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: ".22rem .75rem",
        borderRadius: 999,
        fontSize: ".72rem",
        fontWeight: 700,
        letterSpacing: ".06em",
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
      }}
    >
      {key.charAt(0).toUpperCase() + key.slice(1)}
    </span>
  );
}

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiReview, setAiReview] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [leftTab, setLeftTab] = useState("problem"); // "problem" | "notes"

  const {
    data: sessionData,
    isLoading: loadingSession,
    refetch,
  } = useSessionById(id);
  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;

  const { call, channel, chatClient, isInitializingCall, streamClient } =
    useStreamClient(session, loadingSession, isHost, isParticipant);

  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;

  const [selectedLanguage, setSelectedLanguage] = useState(
    session?.language || "javascript",
  );
  const [code, setCode] = useState(
    problemData?.starterCode?.[selectedLanguage] || "",
  );

  const { emitCodeChange } = useSocket(
    session?.callId,
    useCallback((newCode) => setCode(newCode), []),
  );

  const handleCodeChange = useCallback(
    (value) => {
      setCode(value);
      emitCodeChange(value);
    },
    [emitCodeChange],
  );

  // Set language from session when it loads
  useEffect(() => {
    if (session?.language) setSelectedLanguage(session.language);
  }, [session?.language]);

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

    // Compare actual output with expected output when available
    const expected = problemData?.expectedOutput?.[selectedLanguage];
    if (result.success && expected) {
      result.matched = result.output?.trim() === expected.trim();
    }

    setOutput(result);
    setIsRunning(false);
  };

  const handleReviewCode = async () => {
    setIsReviewing(true);
    try {
      const result = await sessionApi.reviewWithAI(code, selectedLanguage);
      setAiReview(result);
    } catch (err) {
      toast.error(
        err.response?.data?.error || "AI review failed. Please try again.",
      );
    } finally {
      setIsReviewing(false);
    }
  };

  const handleEndSession = () => {
    if (
      confirm(
        "Are you sure you want to end this session? All participants will be notified.",
      )
    ) {
      endSessionMutation.mutate(id, {
        onSuccess: () => navigate("/dashboard"),
      });
    }
  };

  const handleCopyInviteLink = () => {
    const link = `${window.location.origin}/session/${id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* ── Full-page loader while session is loading ── */
  if (loadingSession) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0e14",
          color: "#e8eaf0",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(108,79,246,.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader2Icon
            size={32}
            color="#a78bfa"
            className="spin"
            style={{ animation: "spin 1s linear infinite" }}
          />
        </div>
        <p style={{ fontSize: "1.2rem", fontWeight: 800 }}>Joining session…</p>
        <p style={{ fontSize: ".85rem", color: "rgba(232,234,240,.4)" }}>
          Setting up your collaborative coding environment
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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

        /* ── Left panel tabs ── */
        .left-panel-tabs {
          display: flex;
          gap: 2px;
          padding: 0 12px;
          background: #0a0b10;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .left-panel-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 14px;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #475569;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
        }
        .left-panel-tab:hover { color: #94a3b8; }
        .left-panel-tab-active {
          color: #e2e8f0;
          border-bottom-color: #6366f1;
        }

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

        /* ── Session top bar ── */
        .session-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: .6rem 1.2rem;
          background: #0a0b10;
          border-bottom: 1px solid rgba(255,255,255,.06);
          flex-shrink: 0;
          gap: 1rem;
        }
        .session-topbar-left {
          display: flex;
          align-items: center;
          gap: .75rem;
          min-width: 0;
        }
        .session-topbar-name {
          font-size: .9rem;
          font-weight: 800;
          color: #e8eaf0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .session-topbar-right {
          display: flex;
          align-items: center;
          gap: .6rem;
          flex-shrink: 0;
        }
        .topbar-participants {
          display: flex;
          align-items: center;
          gap: .4rem;
          padding: .35rem .75rem;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 8px;
          font-size: .75rem;
          font-weight: 600;
          color: rgba(232,234,240,.5);
        }
        .topbar-participants .live-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 0 rgba(34,197,94,.5);
          animation: activePulse 2s ease infinite;
        }
        @keyframes activePulse {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,.5); }
          70%  { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        .copy-invite-btn {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          padding: .4rem .85rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: .75rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 3px 12px rgba(99,102,241,.3);
          transition: all .2s ease;
        }
        .copy-invite-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 18px rgba(99,102,241,.45);
        }
        .copy-invite-btn.copied {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 3px 12px rgba(34,197,94,.3);
        }
      `}</style>

      <div className="session-root">
        <Navbar />

        {/* ── Session Top Bar ── */}
        <div className="session-topbar">
          <div className="session-topbar-left">
            <span className="session-topbar-name">
              {session?.name || session?.problem || "Coding Session"}
            </span>
            {session?.difficulty && (
              <DiffBadge difficulty={session.difficulty} />
            )}
          </div>
          <div className="session-topbar-right">
            <div className="topbar-participants">
              <span className="live-dot" />
              <UsersIcon size={12} />
              <span>{session?.participant ? 2 : 1}/2</span>
              {session?.host?.name && (
                <span style={{ color: "rgba(232,234,240,.35)", marginLeft: 4 }}>
                  — {session.host.name}
                  {session?.participant?.name
                    ? `, ${session.participant.name}`
                    : ""}
                </span>
              )}
            </div>
            <button
              className={`copy-invite-btn${copied ? " copied" : ""}`}
              onClick={handleCopyInviteLink}
            >
              {copied ? <CheckIcon size={13} /> : <LinkIcon size={13} />}
              {copied ? "Copied!" : "Copy Invite Link"}
            </button>
            {isHost && session?.status === "active" && (
              <button
                onClick={handleEndSession}
                disabled={endSessionMutation.isPending}
                className="end-btn"
              >
                {endSessionMutation.isPending ? (
                  <Loader2Icon size={14} className="spin" />
                ) : (
                  <LogOutIcon size={14} />
                )}
                End
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflow: "hidden" }}>
          <PanelGroup direction="horizontal">
            {/* ── LEFT PANEL ── */}
            <Panel defaultSize={50} minSize={30}>
              <PanelGroup direction="vertical">
                {/* Problem / Notes tabbed area */}
                <Panel defaultSize={50} minSize={20}>
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#10111a" }}>
                    {/* Tab switcher */}
                    <div className="left-panel-tabs">
                      <button
                        className={`left-panel-tab ${leftTab === "problem" ? "left-panel-tab-active" : ""}`}
                        onClick={() => setLeftTab("problem")}
                      >
                        <BookOpenIcon size={13} />
                        Problem
                      </button>
                      <button
                        className={`left-panel-tab ${leftTab === "notes" ? "left-panel-tab-active" : ""}`}
                        onClick={() => setLeftTab("notes")}
                      >
                        <FileTextIcon size={13} />
                        Notes
                      </button>
                    </div>

                    {/* Tab content */}
                    {leftTab === "notes" ? (
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <NotesPanel
                          sessionId={id}
                          sessionName={session?.name || session?.problem || ""}
                          problemTitle={session?.problem || ""}
                          difficulty={session?.difficulty || ""}
                          userName={user?.fullName || user?.firstName || ""}
                          code={code}
                          aiReview={aiReview}
                        />
                      </div>
                    ) : (
                  <div className="prob-pane" style={{ flex: 1 }}>
                    {/* Header */}
                    <div className="prob-header">
                      <div className="prob-header-top">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h1 className="prob-title">
                            {session?.problem || "Loading..."}
                          </h1>
                        </div>
                        <div className="prob-badges">
                          {session?.difficulty && (
                            <DiffBadge difficulty={session.difficulty} />
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
                          <div className="content-block-header">
                            Description
                          </div>
                          <div className="content-block-body">
                            <p className="desc-text">
                              {problemData.description.text}
                            </p>
                            {problemData.description.notes?.map((note, i) => (
                              <p
                                key={i}
                                className="desc-text"
                                style={{ marginTop: ".75rem" }}
                              >
                                {note}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Examples */}
                      {problemData?.examples?.length > 0 && (
                        <div className="content-block">
                          <div className="content-block-header">Examples</div>
                          <div
                            className="content-block-body"
                            style={{ paddingTop: ".5rem" }}
                          >
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
                                    <span className="io-key output">
                                      Output:
                                    </span>
                                    <span className="io-val">{ex.output}</span>
                                  </div>
                                  {ex.explanation && (
                                    <div className="io-explanation">
                                      <strong>Explanation:</strong>{" "}
                                      {ex.explanation}
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
                          <div className="content-block-header">
                            Constraints
                          </div>
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
                    )}
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
                        isReviewing={isReviewing}
                        onLanguageChange={handleLanguageChange}
                        onCodeChange={handleCodeChange}
                        onRunCode={handleRunCode}
                        onReviewCode={handleReviewCode}
                      />
                    </Panel>

                    <PanelResizeHandle className="rh-row" />

                    <Panel defaultSize={30} minSize={15}>
                      <OutputPanel output={output} aiReview={aiReview} />
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
                        <Loader2Icon
                          size={32}
                          color="#a78bfa"
                          className="spin"
                        />
                      </div>
                      <div className="call-state-title">Connecting…</div>
                      <div className="call-state-sub">
                        Setting up your video call session
                      </div>
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
                      <div className="call-state-sub">
                        Unable to connect to the video call. Please try
                        refreshing.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ height: "100%" }}>
                    <StreamVideo client={streamClient}>
                      <StreamCall call={call}>
                        <VideoCallUI
                          chatClient={chatClient}
                          channel={channel}
                        />
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
