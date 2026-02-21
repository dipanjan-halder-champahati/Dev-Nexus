import express from "express";
import { Webhook } from "svix";
import { ENV } from "../lib/env.js";
import { inngest } from "../lib/inngest.js";
import { connectDB } from "../lib/db.js";
import User from "../models/User.js";

const router = express.Router();

// ──────────────────────────────────────────────────────────────────
// POST /api/webhooks/clerk
//
// Flow:  Clerk dashboard → ngrok → this route
//        1) Save/delete user in MongoDB DIRECTLY (guaranteed)
//        2) Also send event to Inngest for any extra processing
// ──────────────────────────────────────────────────────────────────
router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("\n========== CLERK WEBHOOK HIT ==========");
    console.log("Headers:", JSON.stringify({
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"] ? "present" : "MISSING",
      "content-type": req.headers["content-type"],
    }));

    const WEBHOOK_SECRET = ENV.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error("❌ CLERK_WEBHOOK_SECRET is not set in .env");
      return res.status(500).json({ error: "Server misconfigured" });
    }

    // ── 1. Verify webhook signature ─────────────────────────────
    const svixHeaders = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    let evt;
    try {
      const wh = new Webhook(WEBHOOK_SECRET);
      evt = wh.verify(req.body, svixHeaders);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).json({ error: "Invalid signature" });
    }

    const eventType = evt.type;
    const data = evt.data;
    console.log(`📩 Clerk webhook verified: ${eventType}`);
    console.log("   User id:", data.id);
    console.log("   Data keys:", Object.keys(data));

    // ── 2. Handle user.created → save to MongoDB directly ───────
    if (eventType === "user.created") {
      try {
        await connectDB();

        const email = data.email_addresses?.[0]?.email_address || "";
        const name = `${data.first_name || ""} ${data.last_name || ""}`.trim();
        const profileImage = data.image_url || "";

        console.log(`   Saving user → clerkId: ${data.id}, email: ${email}, name: ${name}`);

        const user = await User.findOneAndUpdate(
          { clerkId: data.id },
          { clerkId: data.id, email, name, profileImage },
          { upsert: true, new: true }
        );

        console.log("✅ User saved to MongoDB:", user._id);
      } catch (dbErr) {
        console.error("❌ Failed to save user to MongoDB:", dbErr.message);
      }
    }

    // ── 3. Handle user.deleted → remove from MongoDB directly ───
    if (eventType === "user.deleted") {
      try {
        await connectDB();
        console.log(`   Deleting user → clerkId: ${data.id}`);
        const result = await User.deleteOne({ clerkId: data.id });
        console.log("🗑️  User deleted from MongoDB. deletedCount:", result.deletedCount);
      } catch (dbErr) {
        console.error("❌ Failed to delete user from MongoDB:", dbErr.message);
      }
    }

    // ── 4. Also forward to Inngest (for any extra background work) ──
    try {
      await inngest.send({
        name: `clerk/${eventType}`,
        data: data,
      });
      console.log(`✅ Event "clerk/${eventType}" also sent to Inngest`);
    } catch (inngestErr) {
      console.error("⚠️  Failed to send event to Inngest (non-fatal):", inngestErr.message);
    }

    console.log("========== WEBHOOK DONE ==========\n");
    return res.status(200).json({ success: true });
  }
);

export default router;
