import { useState, useEffect, useRef } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);
  const initRef = useRef(false); // prevent double-init in StrictMode

  useEffect(() => {
    let videoCall = null;
    let chatClientInstance = null;
    let cancelled = false;

    const initCall = async () => {
      if (!session?.callId) return;
      if (!isHost && !isParticipant) return;
      if (session.status === "completed") return;
      if (initRef.current) return;

      initRef.current = true;

      try {
        // Get a fresh token from our backend (also ensures user exists in Stream)
        const { token, userId, userName, userImage } =
          await sessionApi.getStreamToken();

        if (cancelled) return;

        // ── 1. Video client + call ─────────────────────────
        const client = await initializeStreamClient(
          { id: userId, name: userName, image: userImage },
          token
        );

        if (cancelled) return;
        setStreamClient(client);

        videoCall = client.call("default", session.callId);
        await videoCall.join({ create: false });

        if (cancelled) return;
        setCall(videoCall);

        // ── 2. Chat client + channel ───────────────────────
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          { id: userId, name: userName, image: userImage },
          token
        );

        if (cancelled) return;
        setChatClient(chatClientInstance);

        const chatChannel = chatClientInstance.channel(
          "messaging",
          session.callId
        );
        await chatChannel.watch();

        if (cancelled) return;
        setChannel(chatChannel);
      } catch (error) {
        console.error("Error initializing Stream call:", error);
        if (!cancelled) {
          toast.error("Failed to join video call — please refresh the page.");
        }
      } finally {
        if (!cancelled) setIsInitializingCall(false);
      }
    };

    if (session && !loadingSession) initCall();

    return () => {
      cancelled = true;
      initRef.current = false;
      (async () => {
        try {
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (err) {
          console.error("Cleanup error:", err);
        }
      })();
    };
  }, [session, loadingSession, isHost, isParticipant]);

  return { streamClient, call, chatClient, channel, isInitializingCall };
}

export default useStreamClient;