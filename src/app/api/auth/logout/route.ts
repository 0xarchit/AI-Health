import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { refreshTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { clearCookies } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const refreshTokenCookie = cookieStore.get("refresh_token")?.value;

  if (refreshTokenCookie) {
    const [tokenId] = refreshTokenCookie.split(":");
    if (tokenId) {
      await db.delete(refreshTokens).where(eq(refreshTokens.id, tokenId));
    }
  }

  await clearCookies();
  
  return NextResponse.redirect(new URL("/", req.url));
}
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const refreshTokenCookie = cookieStore.get("refresh_token")?.value;

  if (refreshTokenCookie) {
    const [tokenId] = refreshTokenCookie.split(":");
    if (tokenId) {
      await db.delete(refreshTokens).where(eq(refreshTokens.id, tokenId));
    }
  }

  await clearCookies();
  
  return NextResponse.json({ success: true });
}
