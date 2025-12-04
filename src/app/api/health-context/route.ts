import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { healthContext } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  try {
    const context = await db.query.healthContext.findFirst({
      where: eq(healthContext.userId, session.userId),
    });

    return NextResponse.json({ context: context || null });
  } catch (err: any) {
    console.error("Fetch Health Context Error:", err);
    return NextResponse.json({ error: "Failed to fetch context" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { allergies, conditions, medications, additionalNotes, gender } = body;

    const existingContext = await db.query.healthContext.findFirst({
      where: eq(healthContext.userId, session.userId),
    });

    if (existingContext) {
      await db.update(healthContext)
        .set({
          allergies,
          conditions,
          medications,
          additionalNotes,
          gender,
          updatedAt: new Date(),
        })
        .where(eq(healthContext.id, existingContext.id));
    } else {
      await db.insert(healthContext).values({
        userId: session.userId,
        allergies,
        conditions,
        medications,
        additionalNotes,
        gender: gender || "male",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Save Health Context Error:", err);
    return NextResponse.json({ error: "Failed to save context" }, { status: 500 });
  }
}
