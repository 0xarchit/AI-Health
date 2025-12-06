import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySessionToken } from "@/lib/auth";
import { cookies } from "next/headers";

const getUser = async (userId: string) => {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      email: true,
      name: true,
      picture: true,
      givenName: true,
      familyName: true,
    },
  });
};

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token");

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifySessionToken(sessionToken.value);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await getUser(payload.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { user },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("User API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
