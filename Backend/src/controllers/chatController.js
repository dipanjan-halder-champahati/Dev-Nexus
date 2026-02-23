import { chatClient, upsertStreamUser } from "../lib/stream.js";

/**
 * Generate a Stream chat token for the authenticated user.
 * This token authenticates the frontend with Stream for BOTH video and chat.
 */
export async function getStreamToken(req, res) {
  try {
    const user = req.user; // Added by protectRoute middleware

    if (!user || !user.clerkId) {
      return res.status(400).json({
        error: "User not authenticated or missing clerkId",
      });
    }

    // Ensure the user exists in Stream before generating a token.
    // This covers the case where the Clerk webhook / inngest didn't fire yet.
    await upsertStreamUser({
      id: user.clerkId,
      name: user.name || "Anonymous",
      image: user.profileImage || "",
    });

    // createToken's 2nd arg is a UNIX TIMESTAMP (seconds), NOT a duration.
    // Passing 3600 would produce a token that expired in 1970!
    const expiresAt = Math.round(Date.now() / 1000) + 60 * 60; // 1 hour from now
    const token = chatClient.createToken(user.clerkId, expiresAt);

    return res.status(200).json({
      token,
      userId: user.clerkId,
      userName: user.name || "Anonymous",
      userImage: user.profileImage || "",
    });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    return res.status(500).json({
      error: "Failed to generate chat token",
      details: error.message,
    });
  }
}
