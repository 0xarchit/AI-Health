import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, refreshTokens } from "@/db/schema";
import { encrypt, hash } from "@/lib/security";
import { setAuthCookie, setRefreshCookie, signSessionToken } from "@/lib/auth";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/?error=oauth_failed", req.url));
  }

  try {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const userInfoRes = await client.request({
      url: "https://www.googleapis.com/oauth2/v2/userinfo",
    });
    const userInfo = userInfoRes.data as any;

    if (!tokens.refresh_token) {
      
      
      
    }

    
    let user = await db.query.users.findFirst({
      where: eq(users.googleId, userInfo.id),
    });

    const encryptedRefreshToken = tokens.refresh_token
      ? encrypt(tokens.refresh_token)
      : user?.encryptedRefreshToken; 

    if (!encryptedRefreshToken) {
       return NextResponse.redirect(new URL("/?error=no_refresh_token", req.url));
    }

    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          email: userInfo.email,
          googleId: userInfo.id,
          encryptedRefreshToken: encryptedRefreshToken,
          name: userInfo.name,
          picture: userInfo.picture,
          givenName: userInfo.given_name,
          familyName: userInfo.family_name,
        })
        .returning();
      user = newUser;
    } else {
      
      if (tokens.refresh_token) {
        await db
          .update(users)
          .set({ 
            encryptedRefreshToken,
            name: userInfo.name,
            picture: userInfo.picture,
            givenName: userInfo.given_name,
            familyName: userInfo.family_name,
          })
          .where(eq(users.id, user.id));
      } else {
        
        await db
          .update(users)
          .set({ 
            name: userInfo.name,
            picture: userInfo.picture,
            givenName: userInfo.given_name,
            familyName: userInfo.family_name,
          })
          .where(eq(users.id, user.id));
      }
    }

    
    const appRefreshToken = crypto.randomBytes(32).toString("hex");
    const appRefreshTokenHash = await hash(appRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const [refreshTokenRecord] = await db.insert(refreshTokens).values({
      tokenHash: appRefreshTokenHash,
      userId: user.id,
      expiresAt: expiresAt,
    }).returning();

    
    const sessionToken = await signSessionToken({ userId: user.id });

    
    await setAuthCookie(sessionToken);
    await setRefreshCookie(refreshTokenRecord.id, appRefreshToken);

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (err) {
    console.error("Auth Error:", err);
    return NextResponse.redirect(new URL("/?error=server_error", req.url));
  }
}
