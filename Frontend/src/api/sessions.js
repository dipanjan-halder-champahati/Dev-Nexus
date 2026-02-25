import axiosInstance from "../lib/axios";

export const sessionApi = {
  createSession: async (data) => {
    const response = await axiosInstance.post("/sessions", data);
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await axiosInstance.get("/sessions/active");
    return response.data;
  },
  getMyRecentSessions: async () => {
    const response = await axiosInstance.get("/sessions/my-recent");
    return response.data;
  },

  getSessionById: async (id) => {
    const response = await axiosInstance.get(`/sessions/${id}`);
    return response.data;
  },

  joinSession: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/join`);
    return response.data;
  },
  endSession: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/end`);
    return response.data;
  },
  saveCode: async (id, code, language) => {
    const response = await axiosInstance.post(`/sessions/${id}/save-code`, { code, language });
    return response.data;
  },
  getStreamToken: async () => {
    const response = await axiosInstance.get(`/chat/token`);
    return response.data;
  },
  reviewWithAI: async (code, language) => {
    const response = await axiosInstance.post("/ai-review", { code, language });
    return response.data;
  },

  // ── Notes ──
  saveNote: async (sessionId, content) => {
    const response = await axiosInstance.post("/notes/save", { sessionId, content });
    return response.data;
  },
  getNote: async (sessionId) => {
    const response = await axiosInstance.get(`/notes/${sessionId}`);
    return response.data;
  },
};
