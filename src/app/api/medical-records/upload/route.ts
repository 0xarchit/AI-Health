import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { medicalRecords, users } from "@/db/schema";
import { decrypt } from "@/lib/security";
import { eq } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";

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

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user || !user.encryptedRefreshToken) {
    return NextResponse.json({ error: "User not found or not connected to Google" }, { status: 404 });
  }

  const refreshToken = decrypt(user.encryptedRefreshToken);

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  client.setCredentials({
    refresh_token: refreshToken,
  });

  try {
    const { token: accessToken } = await client.getAccessToken();
    if (!accessToken) {
      throw new Error("Failed to get access token");
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const base64Image = fileBuffer.toString("base64");
    const mimeType = file.type;

    const model = process.env.GEMINI_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Extract all text from this medical record image. Also provide a concise summary of the key health information found (diagnoses, medications, allergies, test results). Return a JSON object with the following structure:
                {
                  "extracted_text": "string (full text extracted)",
                  "summary": "string (concise summary)"
                }
                Do not include markdown formatting. Return ONLY the JSON.`
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
        throw new Error("Failed to process image with Gemini");
    }

    const data = await response.json();
    let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
        throw new Error("No response from Gemini");
    }

    const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || textResponse.match(/\{[\s\S]*\}/);
    const jsonString = Array.isArray(jsonMatch) && jsonMatch[1] ? jsonMatch[1] : (jsonMatch ? jsonMatch[0] : textResponse);
    
    let result;
    try {
        result = JSON.parse(jsonString);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        throw new Error("Failed to parse AI response");
    }

    await db.insert(medicalRecords).values({
      userId: session.userId,
      fileName: file.name,
      extractedText: result.extracted_text,
      summary: result.summary,
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Medical Record Upload Error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
