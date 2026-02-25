import express from "express";
import http from "http";
import { Server } from "socket.io";
import { ENV } from "./lib/env.js";
import path from "path";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import { inngest, functions } from "./lib/inngest.js";
import { serve } from "inngest/express";
import webhookRoute from "./routes/webhookRoute.js";
import { clerkMiddleware } from "@clerk/express";
import { protectRoute } from "./middleware/protectRoute.js";
import chatRoutes from "./routes/chatRoutes.js";
import codeRoute from "./routes/codeRoute.js";
import sessionRoutes from "./routes/sessionRoute.js";
import { setupSocket } from "./socket/socketHandler.js";
import aiReviewRoute from "./routes/aiReviewRoute.js";
import notesRoute from "./routes/notesRoute.js";

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ENV.CLIENT_URL,
    credentials: true,
  },
});

setupSocket(io);
const __dirname = path.resolve();

// =====================
// Webhook route FIRST (needs raw body, before express.json)
// =====================
app.use("/api/webhooks", webhookRoute);

// =====================
// Middlewares
// =====================
app.use(express.json());

app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  }),
);

app.use(clerkMiddleware()); // this adds auth field to re object

// =====================
// Inngest Route
// =====================
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/run-code", codeRoute);
app.use("/api/ai-review", aiReviewRoute);
app.use("/api/notes", notesRoute);

// =====================
// Test Routes
// =====================
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

// =====================
// Manual Sync: Fetch all Clerk users and save to MongoDB
// Visit http://localhost:3000/api/sync-users to seed existing users
// =====================
app.get("/api/sync-users", async (req, res) => {
  try {
    // Use dynamic import so we don't need @clerk/backend installed globally
    const clerkSecretKey = ENV.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      return res
        .status(500)
        .json({ error: "CLERK_SECRET_KEY not set in .env" });
    }

    // Fetch users from Clerk REST API directly
    const response = await fetch(
      "https://api.clerk.com/v1/users?limit=100&order_by=-created_at",
      {
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Clerk API error:", response.status, errText);
      return res
        .status(500)
        .json({ error: "Failed to fetch from Clerk API", details: errText });
    }

    const clerkUsers = await response.json();
    console.log(`📋 Fetched ${clerkUsers.length} users from Clerk`);

    // Import User model
    const { default: User } = await import("./models/User.js");
    const { connectDB: connectDatabase } = await import("./lib/db.js");
    await connectDatabase();

    const results = [];
    for (const u of clerkUsers) {
      const email = u.email_addresses?.[0]?.email_address || "";
      const name = `${u.first_name || ""} ${u.last_name || ""}`.trim();
      const profileImage = u.image_url || "";

      const saved = await User.findOneAndUpdate(
        { clerkId: u.id },
        { clerkId: u.id, email, name, profileImage },
        { upsert: true, new: true },
      );

      results.push({ clerkId: u.id, email, name, mongoId: saved._id });
      console.log(`✅ Synced: ${name} (${email}) → MongoDB _id: ${saved._id}`);
    }

    return res.status(200).json({
      success: true,
      message: `Synced ${results.length} users from Clerk to MongoDB`,
      users: results,
    });
  } catch (err) {
    console.error("❌ Sync error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// =====================
// Production Frontend Serve
// =====================
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// =====================
// Server Start
// =====================
const port = ENV.PORT || 3000;

const StartServer = async () => {
  try {
    await connectDB();

    httpServer.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.log("Failed to connect to the db ❌", err);
    process.exit(1);
  }
};

StartServer();
