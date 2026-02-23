// Code execution — proxied through our backend for safety
import axiosInstance from "./axios";

/**
 * @param {string} language - programming language (javascript | python | java)
 * @param {string} code - source code to execute
 * @returns {Promise<{success:boolean, output?:string, error?:string}>}
 */
export async function executeCode(language, code) {
  try {
    const { data } = await axiosInstance.post("/run-code", { language, code });

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
    // Axios wraps the response in error.response
    const msg =
      error.response?.data?.error ||
      error.message ||
      "Failed to execute code";
    return {
      success: false,
      error: msg,
    };
  }
}