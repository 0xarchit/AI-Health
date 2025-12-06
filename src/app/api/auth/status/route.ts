import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { refreshTokens } from "@/db/schema";
import { compareHash } from "@/lib/security";
import { setAuthCookie, verifySessionToken } from "@/lib/auth"; 
import { signSessionToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  const refreshTokenCookie = cookieStore.get("refresh_token")?.value;
  
  const redirectTo = req.nextUrl.searchParams.get("redirect");

  
  const successResponse = (data: any) => {
    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
    return NextResponse.json(data);
  };

  const failureResponse = () => {
    if (redirectTo) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  };

  
  if (sessionToken) {
    const session = await verifySessionToken(sessionToken);
    if (session) {
      return successResponse({ isAuthenticated: true, userId: session.userId });
    }
  }

  
  if (refreshTokenCookie) {
    try {
      const [tokenId, tokenSecret] = refreshTokenCookie.split(":");
      
      if (tokenId && tokenSecret) {
        const tokenRecord = await db.query.refreshTokens.findFirst({
          where: eq(refreshTokens.id, tokenId),
        });

        
        if (tokenRecord && !tokenRecord.revoked && new Date() < tokenRecord.expiresAt) {
          const isValid = await compareHash(tokenSecret, tokenRecord.tokenHash);
          
          if (isValid) {
            
            const newSessionToken = await signSessionToken({ userId: tokenRecord.userId });
            await setAuthCookie(newSessionToken);

            return successResponse({ 
              isAuthenticated: true, 
              userId: tokenRecord.userId,
              refreshed: true 
            });
          }
        }
      }
    } catch (error) {
       console.error("Auth Status Refresh Check Failed", error);
    }
  }

  
  return failureResponse();
}
