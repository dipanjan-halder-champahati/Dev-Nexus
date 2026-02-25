// Code execution — proxied through our backend for safety
import axiosInstance from "./axios";

const EXECUTION_TIMEOUT_MS = 20_000; // 20 seconds client-side timeout

/**
 * @param {string} language - programming language (javascript | python | java)
 * @param {string} code - source code to execute
 * @returns {Promise<{success:boolean, output?:string, error?:string}>}
 */
export async function executeCode(language, code) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EXECUTION_TIMEOUT_MS);

  try {
    const { data } = await axiosInstance.post(
      "/run-code",
      { language, code },
      { signal: controller.signal },
    );

    if (data.error) {
      return {
        success: false,
        output: data.output || "",
        error: data.error,
      };
    }

    return {
      success: true,
      output: data.output || "No output",
    };
  } catch (error) {
    // Cancelled by AbortController
    if (error.name === "AbortError" || error.code === "ERR_CANCELED") {
      return {
        success: false,
        error: "Code execution timed out (20s). Check for infinite loops or long-running operations.",
      };
    }

    // Axios wraps the response in error.response
    const msg =
      error.response?.data?.error ||
      error.message ||
      "Failed to execute code";
    return {
      success: false,
      error: msg,
    };
  } finally {
    clearTimeout(timeout);
  }
}