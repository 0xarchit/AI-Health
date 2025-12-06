import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;

  if (
    request.nextUrl.pathname.startsWith("/dashboard") || 
    request.nextUrl.pathname.startsWith("/contact") ||
    request.nextUrl.pathname.startsWith("/profile")
  ) {
    if (!sessionToken) {
      const redirectUrl = new URL("/api/auth/status", request.url);
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/contact/:path*"
  ],
};
