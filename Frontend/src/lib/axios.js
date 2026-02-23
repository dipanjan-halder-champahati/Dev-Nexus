import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.error(
    "[axios] VITE_API_URL is not set! Add it to Frontend/.env, e.g.:\n  VITE_API_URL=http://localhost:3000/api"
  );
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends cookies automatically on every request
});

// Response interceptor — surfaces the real error message from the backend
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed info for debugging
    if (error.response) {
      console.error(
        `[API ${error.response.status}] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response.data
      );
    } else {
      console.error("[API] Network error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
