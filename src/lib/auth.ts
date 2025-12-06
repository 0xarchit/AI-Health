import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const ALG = "HS256";

export async function signSessionToken(payload: { userId: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("15m") 
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string };
  } catch (e) {
    return null;
  }
}

export async function validateRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60, 
  });

}

export async function setRefreshCookie(id: string, token: string) {
  const cookieStore = await cookies();
  cookieStore.set("refresh_token", `${id}:${token}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: 30 * 24 * 60 * 60, 
  });
}

export async function clearCookies() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: "session_token", path: "/" });
  cookieStore.delete({ name: "refresh_token", path: "/api/auth" });

}
