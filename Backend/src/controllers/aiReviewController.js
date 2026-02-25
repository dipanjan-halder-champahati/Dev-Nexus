import Groq from "groq-sdk";

let groq;

function getGroq() {
  if (!groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set in environment variables");
    }
    groq = new Groq({ apiKey });
  }
  return groq;
}

/** Default fallback structure so the frontend never gets undefined fields */
const EMPTY_REVIEW = {
  timeComplexity: "N/A",
  spaceComplexity: "N/A",
  optimization: "No optimization suggestions available.",
  explanation: "Unable to generate a review at this time.",
};

/**
 * Safely parse the AI response. If JSON.parse fails attempt to extract
 * key fields via regex so we still return something useful.
 */
function parseReviewResponse(text) {
  try {
    const parsed = JSON.parse(text);
    return {
      timeComplexity: parsed.timeComplexity || EMPTY_REVIEW.timeComplexity,
      spaceComplexity: parsed.spaceComplexity || EMPTY_REVIEW.spaceComplexity,
      optimization: parsed.optimization || EMPTY_REVIEW.optimization,
      explanation: parsed.explanation || EMPTY_REVIEW.explanation,
    };
  } catch {
    // Fallback: return the raw text as the explanation
    return {
      ...EMPTY_REVIEW,
      explanation: text || EMPTY_REVIEW.explanation,
    };
  }
}

const AI_TIMEOUT_MS = 25_000; // 25 second timeout for AI calls

export async function reviewCode(req, res) {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: "Code and language are required" });
    }

    const client = getGroq();

    // Race the AI call against a timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    let chatCompletion;
    try {
      chatCompletion = await client.chat.completions.create(
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                'You are a code review assistant. Analyze code and return ONLY valid JSON with this exact structure: { "timeComplexity": "", "spaceComplexity": "", "optimization": "", "explanation": "" }. No markdown, no extra text.',
            },
            {
              role: "user",
              content: `Analyze the following ${language} code:\n\n${code}`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        },
        { signal: controller.signal },
      );
    } catch (fetchErr) {
      if (fetchErr.name === "AbortError") {
        return res.status(504).json({
          error: "AI review timed out. Please try again with a shorter code snippet.",
        });
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeout);
    }

    const responseText = chatCompletion.choices?.[0]?.message?.content || "";
    const parsed = parseReviewResponse(responseText);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error("AI Review error:", err.message || err);

    const msg = err.message || "";
    if (msg.includes("429") || msg.includes("quota") || msg.includes("rate")) {
      return res.status(429).json({
        error: "AI API quota exceeded. Please try again later.",
      });
    }

    return res.status(500).json({
      error: "Failed to process AI review. Please try again.",
    });
  }
}
