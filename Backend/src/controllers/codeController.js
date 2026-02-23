/**
 * Code Execution Controller
 * Proxies code execution requests to the Judge0 Community Edition API (sandboxed).
 * Never runs code directly on the server.
 * 
 * Note: Piston API is now whitelist-only (as of Feb 15, 2026).
 * Using Judge0 Community Edition (https://ce.judge0.com) as the free alternative.
 */

// Judge0 Community Edition - Free tier, no authentication required
// Correct domain: ce.judge0.com (note: no /api path)
const JUDGE0_API = "https://ce.judge0.com";

const LANGUAGE_MAP = {
  javascript: { languageId: 63, ext: "js" },      // Node.js 18.15.0
  python:     { languageId: 71, ext: "py" },      // Python 3.10.0
  java:       { languageId: 62, ext: "java" },    // Java 15.0.2
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

    const langConfig = LANGUAGE_MAP[language.toLowerCase()];
    if (!langConfig) {
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

    // ── Submit code to Judge0 ──
    const submitRes = await fetch(`${JUDGE0_API}/submissions?wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language_id: langConfig.languageId,
        source_code: code,
        // Limit execution time to 10 seconds
        cpu_time_limit: 10,
        memory_limit: 524288, // 512 MB
      }),
    });

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
    // 1 = In Queue, 2 = Processing, 3 = Accepted, 4 = Wrong Answer,
    // 5 = Time Limit, 6 = Compilation Error, 7 = Runtime Error, 8 = Execution Error
    
    const statusId = result.status?.id;
    let output = result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf-8') : '';
    const stderr = result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf-8') : '';
    const compileOutput = result.compile_output ? Buffer.from(result.compile_output, 'base64').toString('utf-8') : '';

    // Handle errors based on status codes
    if (statusId === 6) {
      // Compilation Error
      return res.status(200).json({
        output: null,
        error: compileOutput || "Compilation error",
      });
    }

    if (statusId === 7) {
      // Runtime Error - include both output and error
      return res.status(200).json({
        output: output.slice(0, MAX_OUTPUT_LENGTH) || null,
        error: (stderr || "Runtime error").slice(0, MAX_OUTPUT_LENGTH),
      });
    }

    if (statusId === 5) {
      // Time Limit Exceeded
      return res.status(200).json({
        output: output.slice(0, MAX_OUTPUT_LENGTH) || null,
        error: "Code execution timed out. Make sure your code doesn't have infinite loops.",
      });
    }

    // statusId === 3 or 4 (Accepted or Wrong Answer - both successful execution)
    // Return success with stdout output, ignoring stderr unless it's a true error
    return res.status(200).json({
      output: output.slice(0, MAX_OUTPUT_LENGTH) || "No output",
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
