import {
  CallControls,
  CallingState,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Loader2Icon, MessageSquareIcon, UsersIcon, XIcon, VideoIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

function VideoCallUI({ chatClient, channel }) {
  const navigate = useNavigate();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (callingState === CallingState.JOINING) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700&family=JetBrains+Mono:wght@400&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        `}</style>
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0b10",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 30px rgba(99,102,241,0.4)",
              marginBottom: 4,
            }}
          >
            <VideoIcon size={28} color="#fff" />
          </div>
          <Loader2Icon
            size={28}
            color="#6366f1"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>
              Joining session...
            </p>
            <p style={{ fontSize: 12, color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>
              Setting up audio & video
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

        .video-ui {
          height: 100%;
          display: flex;
          gap: 12px;
          padding: 12px;
          background: #07080d;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
        }
        .video-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
        }
        .video-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 10px 16px;
        }
        .participant-badge {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .chat-toggle {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          border-radius: 9px;
          border: 1px solid;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .chat-toggle-off {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.08);
          color: #64748b;
        }
        .chat-toggle-off:hover {
          background: rgba(99,102,241,0.08);
          border-color: rgba(99,102,241,0.3);
          color: #818cf8;
        }
        .chat-toggle-on {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 4px 14px rgba(99,102,241,0.35);
        }
        .video-stage {
          flex: 1;
          background: #0d0e14;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05);
          position: relative;
        }
        .controls-bar {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 12px 20px;
          display: flex;
          justify-content: center;
        }
        /* Chat panel */
        .chat-panel {
          display: flex;
          flex-direction: column;
          border-radius: 16px;
          overflow: hidden;
          background: #0f1117;
          border: 1px solid rgba(255,255,255,0.07);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
        }
        .chat-header {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #0d0e14;
        }
        .close-chat-btn {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .close-chat-btn:hover {
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.2);
          color: #ef4444;
        }
        @keyframes dotBlink { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
      `}</style>

      <div className="video-ui str-video">
        {/* Main column */}
        <div className="video-main">
          {/* Top bar */}
          <div className="video-topbar">
            <div className="participant-badge">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <VideoIcon size={15} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>
                  Live Session
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#22c55e",
                      display: "inline-block",
                      animation: "dotBlink 2s infinite",
                    }}
                  />
                  <span style={{ fontSize: 11, color: "#64748b" }}>
                    {participantCount} {participantCount === 1 ? "participant" : "participants"}
                  </span>
                </div>
              </div>
            </div>

            {chatClient && channel && (
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`chat-toggle ${isChatOpen ? "chat-toggle-on" : "chat-toggle-off"}`}
              >
                <MessageSquareIcon size={14} />
                Chat
              </button>
            )}
          </div>

          {/* Video stage */}
          <div className="video-stage">
            <SpeakerLayout />
          </div>

          {/* Controls */}
          <div className="controls-bar">
            <CallControls onLeave={() => navigate("/dashboard")} />
          </div>
        </div>

        {/* Chat panel */}
        {chatClient && channel && (
          <div
            className="chat-panel"
            style={{
              width: isChatOpen ? 300 : 0,
              opacity: isChatOpen ? 1 : 0,
              flexShrink: 0,
              pointerEvents: isChatOpen ? "all" : "none",
            }}
          >
            {isChatOpen && (
              <>
                <div className="chat-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MessageSquareIcon size={14} color="#6366f1" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>
                      Session Chat
                    </span>
                  </div>
                  <button className="close-chat-btn" onClick={() => setIsChatOpen(false)}>
                    <XIcon size={13} />
                  </button>
                </div>
                <div style={{ flex: 1, overflow: "hidden" }} className="stream-chat-dark">
                  <Chat client={chatClient} theme="str-chat__theme-dark">
                    <Channel channel={channel}>
                      <Window>
                        <MessageList />
                        <MessageInput />
                      </Window>
                      <Thread />
                    </Channel>
                  </Chat>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default VideoCallUI;