import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { scans, images } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { unstable_cache, revalidateTag } from "next/cache";

const getScans = async (userId: string) => {
  return await db
    .select()
    .from(scans)
    .where(eq(scans.userId, userId))
    .orderBy(desc(scans.createdAt))
    .limit(10);
};

const getCachedScans = (userId: string) =>
  unstable_cache(
    async () => getScans(userId),
    [`history-${userId}`],
    {
      tags: [`history-${userId}`],
      revalidate: 300 
    }
  )();

export async function GET(req: NextRequest) {
  try {
    
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifySessionToken(sessionToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    
    const userScans = await getCachedScans(payload.userId);

    return NextResponse.json(
      { scans: userScans },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        },
      }
    );
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifySessionToken(sessionToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const userScans = await db
      .select({ imageUrl: scans.imageUrl })
      .from(scans)
      .where(eq(scans.userId, payload.userId));

    await Promise.all(
      userScans.map(async (scan) => {
        if (scan.imageUrl && scan.imageUrl.includes("/api/image/")) {
          const imageId = scan.imageUrl.split("/").pop();
          if (imageId) {
             try {
               const imageRecord = await db.query.images.findFirst({
                 where: eq(images.id, imageId)
               });

               if (imageRecord && imageRecord.fileId) {
                 const privateKey = process.env.IMG_PVT_API_KEY;
                 if (privateKey) {
                    await fetch(`https://api.imagekit.io/v1/files/${imageRecord.fileId}`, {
                      method: "DELETE",
                      headers: {
                        Authorization: `Basic ${Buffer.from(privateKey + ":").toString("base64")}`,
                      },
                    });
                 }
                 await db.delete(images).where(eq(images.id, imageId));
               }
             } catch (e) {
               console.error("Failed to delete image", e);
             }
          }
        }
      })
    );

    await db.delete(scans).where(eq(scans.userId, payload.userId));

    (revalidateTag as any)(`history-${payload.userId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("History delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
