import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { images } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const imageRecord = await db.query.images.findFirst({
      where: eq(images.id, id),
    });

    if (!imageRecord) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    let imgbbResponse;
    try {
      imgbbResponse = await fetch(imageRecord.url, { signal: controller.signal });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return new NextResponse("Upstream image fetch timed out", { status: 504 });
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
    
    if (!imgbbResponse.ok) {
      return new NextResponse("Failed to fetch image", { status: 502 });
    }

    const imageBuffer = await imgbbResponse.arrayBuffer();
    const contentType = imgbbResponse.headers.get("content-type") || "image/jpeg";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });

  } catch (error) {
    console.error("Image proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
