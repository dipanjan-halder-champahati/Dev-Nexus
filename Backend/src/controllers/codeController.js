/**
 * Code Execution Controller
 * Proxies code execution requests to the Judge0 Community Edition API (sandboxed).
 * Never runs code directly on the server.
 */

const JUDGE0_API = "https://ce.judge0.com";

const LANGUAGE_MAP = {
  javascript: 63,  // Node.js 18.15.0
  python:     71,  // Python 3.10.0
  java:       62,  // Java 15.0.2
};

// Safety limits
const MAX_CODE_LENGTH = 50_000;       // 50 KB
const MAX_OUTPUT_LENGTH = 10_000;     // 10 KB
const EXECUTION_TIMEOUT_MS = 15_000;  // 15 seconds

export async function runCode(req, res) {
  try {
    const { language, code } = req.body;

    // ── Validation ──
    if (!language || !code) {
      return res.status(400).json({
        output: null,
        error: "Language and code are required.",
      });
    }

    const languageId = LANGUAGE_MAP[language.toLowerCase()];
    if (!languageId) {
      return res.status(400).json({
        output: null,
        error: `Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_MAP).join(", ")}`,
      });
    }

    if (code.length > MAX_CODE_LENGTH) {
      return res.status(400).json({
        output: null,
        error: `Code too long. Maximum ${MAX_CODE_LENGTH} characters allowed.`,
      });
    }

    // ── Submit code to Judge0 CE ──
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), EXECUTION_TIMEOUT_MS);

    let submitRes;
    try {
      submitRes = await fetch(
        `${JUDGE0_API}/submissions?base64_encoded=false&wait=true`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            language_id: languageId,
            source_code: code,
            cpu_time_limit: 10,
            memory_limit: 524288, // 512 MB
          }),
        }
      );
    } catch (fetchErr) {
      if (fetchErr.name === "AbortError") {
        return res.status(200).json({
          output: null,
          error: "Code execution timed out. Make sure your code doesn't have infinite loops.",
        });
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeout);
    }

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      console.error("Judge0 API error:", submitRes.status, errText);
      return res.status(502).json({
        output: null,
        error: "Code execution service is temporarily unavailable. Please try again.",
      });
    }

    const result = await submitRes.json();

    // Judge0 status codes:
    // 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit Exceeded,
    // 6 = Compilation Error, 7-12 = Various runtime errors
    const statusId = result.status?.id;
    const stdout = (result.stdout || "").slice(0, MAX_OUTPUT_LENGTH);
    const stderr = (result.stderr || "").slice(0, MAX_OUTPUT_LENGTH);
    const compileOutput = (result.compile_output || "").slice(0, MAX_OUTPUT_LENGTH);

    // Compilation Error
    if (statusId === 6) {
      return res.status(200).json({
        output: null,
        error: compileOutput || "Compilation error",
      });
    }

    // Time Limit Exceeded
    if (statusId === 5) {
      return res.status(200).json({
        output: stdout || null,
        error: "Code execution timed out. Make sure your code doesn't have infinite loops.",
      });
    }

    // Runtime Error (status 7-12)
    if (statusId >= 7) {
      return res.status(200).json({
        output: stdout || null,
        error: stderr || "Runtime error",
      });
    }

    // Success (status 3 = Accepted, 4 = Wrong Answer — both ran successfully)
    return res.status(200).json({
      output: stdout || "No output",
      error: null,
    });
  } catch (err) {
    console.error("runCode error:", err);
    return res.status(500).json({
      output: null,
      error: "Internal server error while executing code.",
    });
  }
}
