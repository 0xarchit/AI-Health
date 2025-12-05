import { db } from "@/lib/db";
import { refreshTokens } from "@/db/schema";
import { lt } from "drizzle-orm";

async function cleanup() {
  console.log("Cleaning up expired tokens...");
  const now = new Date();
  try {
    const res = await db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, now));
    console.log("Cleanup complete.");
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
  process.exit(0);
}

cleanup();
