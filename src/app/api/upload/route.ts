
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { images, scans } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await validateRequest();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File;

  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const crypto = require('crypto');
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  const hexHash = hashSum.digest('hex');
  const existingScan = await db.query.scans.findFirst({
    where: and(
      eq(scans.userId, session.userId),
      eq(scans.imageHash, hexHash)
    ),
  });

  if (existingScan && existingScan.imageUrl) {
    console.log("Duplicate upload found via hash, returning existing URL.");
    return NextResponse.json({ 
      success: true, 
      url: existingScan.imageUrl,
      cached: true
    });
  }

  const privateKey = process.env.IMG_PVT_API_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  try {
    const imageKitFormData = new FormData();
    imageKitFormData.append("file", file);
    imageKitFormData.append("fileName", file.name);

    const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(privateKey + ":").toString("base64")}`,
      },
      body: imageKitFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "ImageKit upload failed");
    }

    const [imageRecord] = await db.insert(images).values({
      userId: session.userId,
      url: data.url,
      fileId: data.fileId,
    }).returning();

    return NextResponse.json({ 
      success: true, 
      url: `/api/image/${imageRecord.id}`,
    });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
