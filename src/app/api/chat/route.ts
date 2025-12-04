import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, healthContext, medicalRecords } from "@/db/schema";
import { decrypt } from "@/lib/security";
import { eq, desc } from "drizzle-orm";
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

  const { message, foodContext } = await req.json();

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
    
    const context = await db.query.healthContext.findFirst({
      where: eq(healthContext.userId, session.userId),
    });

    
    const records = await db.query.medicalRecords.findMany({
      where: eq(medicalRecords.userId, session.userId),
      orderBy: [desc(medicalRecords.createdAt)],
      limit: 5,
    });

    const contextString = `
      User Health Context:
      Allergies: ${context?.allergies?.join(", ") || "None"}
      Conditions: ${context?.conditions?.join(", ") || "None"}
      Medications: ${context?.medications?.join(", ") || "None"}
      Notes: ${context?.additionalNotes || "None"}

      Recent Medical Record Summaries:
      ${records.map(r => `- ${r.fileName}: ${r.summary}`).join("\n")}
    `;

    const foodContextString = foodContext ? `
      Current Food Analysis Context:
      Food: ${foodContext.food_name}
      Ingredients: ${foodContext.ingredients?.join(", ")}
      Nutrition: ${JSON.stringify(foodContext.nutrition)}
      Health Assessment: ${foodContext.health_assessment}
    ` : "";

    const { token: accessToken } = await client.getAccessToken();
    if (!accessToken) {
      throw new Error("Failed to get access token");
    }

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
                text: `You are a helpful AI health assistant.
                
                ${contextString}

                ${foodContextString}

                User Question: ${message}

                Answer the user's question taking into account their health context and the current food analysis (if provided). Be concise, helpful, and empathetic. If the user asks about medical advice, remind them to consult a professional.`
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
        throw new Error("Failed to get response from Gemini");
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ response: textResponse });

  } catch (err: any) {
    console.error("Chat Error:", err);
    return NextResponse.json({ error: err.message || "Chat failed" }, { status: 500 });
  }
}
