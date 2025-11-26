import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { refreshTokens } from "@/db/schema";
import { compareHash, hash } from "@/lib/security";
import { setAuthCookie, setRefreshCookie, signSessionToken } from "@/lib/auth";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const refreshTokenCookie = cookieStore.get("refresh_token")?.value;

  if (!refreshTokenCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [tokenId, tokenSecret] = refreshTokenCookie.split(":");
  if (!tokenId || !tokenSecret) {
    return NextResponse.json({ error: "Invalid token format" }, { status: 401 });
  }

  try {
    const tokenRecord = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.id, tokenId),
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Token not found" }, { status: 401 });
    }

    if (tokenRecord.revoked || new Date() > tokenRecord.expiresAt) {
      return NextResponse.json({ error: "Token expired or revoked" }, { status: 401 });
    }

    const isValid = await compareHash(tokenSecret, tokenRecord.tokenHash);
    if (!isValid) {
      
      
      await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.id, tokenId));
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    
    
    await db.delete(refreshTokens).where(eq(refreshTokens.id, tokenId));

    
    const newRefreshToken = crypto.randomBytes(32).toString("hex");
    const newRefreshTokenHash = await hash(newRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const [newTokenRecord] = await db.insert(refreshTokens).values({
      tokenHash: newRefreshTokenHash,
      userId: tokenRecord.userId,
      expiresAt: expiresAt,
    }).returning();

    
    const sessionToken = await signSessionToken({ userId: tokenRecord.userId });

    
    await setAuthCookie(sessionToken);
    await setRefreshCookie(newTokenRecord.id, newRefreshToken);

    return NextResponse.json({ success: true, token: sessionToken });
  } catch (err) {
    console.error("Refresh Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
