import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { upsertStreamUser, deleteStreamUser } from "./stream.js";

// ── Inngest client ──────────────────────────────────────────────
export const inngest = new Inngest({ id: "devnexus" });

// ── 1. user.created → save to MongoDB ──────────────────────────
const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    const result = await step.run("save-user-to-db", async () => {
      await connectDB();

      const data = event.data;
      console.log("⚡ [sync-user] Full event.data:", JSON.stringify(data, null, 2));

      if (!data.id) {
        console.error("❌ Missing Clerk user id in event.data");
        throw new Error("Missing Clerk user id in event.data");
      }

      const email = data.email_addresses?.[0]?.email_address || "";
      const name  = `${data.first_name || ""} ${data.last_name || ""}`.trim();
      const profileImage = data.image_url || "";

      console.log("   Parsed → clerkId:", data.id, "| email:", email, "| name:", name);

      // Upsert: create if new, update if already exists (safe for retries)
      const user = await User.findOneAndUpdate(
        { clerkId: data.id },
        { clerkId: data.id, email, name, profileImage },
        { upsert: true, new: true, runValidators: true }
      );

      console.log("✅ User saved to MongoDB:", user._id, "| email:", email);

      // Also upsert into Stream (chat) service
      try {
        await upsertStreamUser({
          id: user.clerkId.toString(),
          name: user.name || name,
          image: user.profileImage || profileImage,
          email: user.email || email,
        });
      } catch (e) {
        console.error("Error upserting user into Stream:", e);
      }

      return { userId: user._id.toString() };
    });

    return result;
  }
);



// ── 2. user.deleted → remove from MongoDB ──────────────────────
const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event, step }) => {
    const result = await step.run("remove-user-from-db", async () => {
      await connectDB();

      const data = event.data;
      console.log("⚡ [delete-user-from-db] Full event.data:", JSON.stringify(data, null, 2));

      if (!data.id) {
        console.error("❌ Missing Clerk user id in event.data");
        throw new Error("Missing Clerk user id in event.data");
      }

      const deleted = await User.deleteOne({ clerkId: data.id });
      console.log("🗑️  User deleted from MongoDB. deletedCount:", deleted.deletedCount);

      // Also delete from Stream (chat) service
      try {
        await deleteStreamUser(data.id.toString());
      } catch (e) {
        console.error("Error deleting user from Stream:", e);
      }

      return { deletedCount: deleted.deletedCount };
    });

    return result;
  }
);

// ── Export all functions for serve() ────────────────────────────
export const functions = [syncUser, deleteUserFromDB];
