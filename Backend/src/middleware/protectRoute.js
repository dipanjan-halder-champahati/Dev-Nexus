import { requireAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

      if (!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });

      // Try to find the user in MongoDB
      let user = await User.findOne({ clerkId });

      // If user doesn't exist yet (webhook/inngest hasn't synced them),
      // fetch their info from Clerk and create them on the fly.
      if (!user) {
        console.log(`[protectRoute] User ${clerkId} not in DB — syncing from Clerk...`);

        try {
          const clerkUser = await clerkClient.users.getUser(clerkId);

          const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
          const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User";
          const profileImage = clerkUser.imageUrl || "";

          user = await User.findOneAndUpdate(
            { clerkId },
            { clerkId, email, name, profileImage },
            { upsert: true, new: true, runValidators: true }
          );

          console.log(`[protectRoute] Auto-synced user ${clerkId} → ${user._id}`);

          // Also sync to Stream so video/chat calls work immediately
          try {
            await upsertStreamUser({
              id: clerkId,
              name: user.name,
              image: user.profileImage,
            });
          } catch (streamErr) {
            console.error("[protectRoute] Stream upsert failed (non-blocking):", streamErr.message);
          }
        } catch (clerkErr) {
          console.error("[protectRoute] Failed to fetch user from Clerk:", clerkErr.message);
          return res.status(404).json({ message: "User not found and could not be synced" });
        }
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error in protectRoute middleware:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];