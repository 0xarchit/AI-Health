import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { healthContext } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache, revalidateTag } from "next/cache";

const getHealthContext = async (userId: string) => {
  return await db.query.healthContext.findFirst({
    where: eq(healthContext.userId, userId),
  });
};

const getCachedHealthContext = (userId: string) => 
  unstable_cache(
    async () => getHealthContext(userId),
    [`health-context-${userId}`],
    {
      tags: [`health-context-${userId}`],
      revalidate: 300 
    }
  )();

export async function GET(req: NextRequest) {
  const session = await validateRequest();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const context = await getCachedHealthContext(session.userId);

    return NextResponse.json(
      { context: context || null },
      {
        headers: {
          "Cache-Control": "public, max-age=900, stale-while-revalidate=60",
        },
      }
    );
  } catch (err: any) {
    console.error("Fetch Health Context Error:", err);
    return NextResponse.json({ error: "Failed to fetch context" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await validateRequest();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    (revalidateTag as any)(`health-context-${session.userId}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Save Health Context Error:", err);
    return NextResponse.json({ error: "Failed to save context" }, { status: 500 });
  }
}
