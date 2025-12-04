import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { medicalRecords } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

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
    const records = await db.query.medicalRecords.findMany({
      where: eq(medicalRecords.userId, session.userId),
      orderBy: [desc(medicalRecords.createdAt)],
    });

    return NextResponse.json({ records });
  } catch (err: any) {
    console.error("Fetch Medical Records Error:", err);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Record ID required" }, { status: 400 });
  }

  try {
    await db.delete(medicalRecords).where(and(eq(medicalRecords.id, id), eq(medicalRecords.userId, session.userId)));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete Medical Record Error:", err);
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
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
    const { id, summary } = body;

    if (!id || !summary) {
      return NextResponse.json({ error: "ID and summary required" }, { status: 400 });
    }

    await db.update(medicalRecords)
      .set({ summary })
      .where(and(eq(medicalRecords.id, id), eq(medicalRecords.userId, session.userId)));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Update Medical Record Error:", err);
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
  }
}
