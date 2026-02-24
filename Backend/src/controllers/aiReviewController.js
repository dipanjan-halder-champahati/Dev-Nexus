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

export async function reviewCode(req, res) {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: "Code and language are required" });
    }

    const client = getGroq();

    const chatCompletion = await client.chat.completions.create({
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
    });

    const responseText = chatCompletion.choices[0].message.content;
    const parsed = JSON.parse(responseText);
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
