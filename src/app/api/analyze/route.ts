import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, scans } from "@/db/schema";
import { decrypt } from "@/lib/security";
import { eq, and } from "drizzle-orm";
import path, { join } from "path";
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

  
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
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

    if (existingScan) {
      console.log("Duplicate scan found, returning cached result.");
      return NextResponse.json({ 
        success: true, 
        nutrition: JSON.parse(existingScan.nutritionJson),
        cached: true 
      });
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
                text: `Analyze this food image. Return a strict JSON object with the following structure:
                {
                  "food_name": "string",
                  "description": "string (brief description)",
                  "ingredients": ["string"],
                  "nutrition": {
                    "calories": number,
                    "carbs": number, 
                    "fat": number, 
                    "protein": number, 
                    "sugar": number, 
                    "sodium": number, 
                    "fiber": number 
                  },
                  "health_assessment": "string (Healthy, Moderate, Unhealthy - and why)",
                  "warnings": ["string"],
                  "confidence_score": number (0-1)
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
        const errorText = await response.text();
        console.error("Gemini API Error:", errorText);
        
        let friendlyError = "Analysis failed. Please try again.";
        let status = 500;

        try {
          const errorJson = JSON.parse(errorText);
          const code = errorJson.error?.code || response.status;
          const message = errorJson.error?.message || response.statusText;

          if (code === 429) {
            friendlyError = "You have exceeded your free Gemini API quota. Please try again later.";
            status = 429;
          } else if (code === 503) {
            friendlyError = "The AI service is currently overloaded. Please try again in a moment.";
            status = 503;
          } else if (code === 400) {
            friendlyError = "The image could not be processed. Please try a different image.";
            status = 400;
          } else if (code === 403) {
             friendlyError = "Permission denied. Please ensure the Google Cloud API is enabled.";
             status = 403;
          } else {
             friendlyError = `AI Service Error: ${message}`;
          }
        } catch (e) {
           
           if (response.status === 503) friendlyError = "The AI service is currently overloaded.";
           else if (response.status === 429) friendlyError = "Quota exceeded. Please try again later.";
        }

        throw new Error(friendlyError);
    }

    const data = await response.json();
    
    

    
    let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
        throw new Error("No response from Gemini");
    }

    
    const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || textResponse.match(/\{[\s\S]*\}/);
    const jsonString = Array.isArray(jsonMatch) && jsonMatch[1] ? jsonMatch[1] : (jsonMatch ? jsonMatch[0] : textResponse);
    
    let nutritionData;
    try {
        nutritionData = JSON.parse(jsonString);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Raw Text:", textResponse);
        throw new Error("Failed to parse AI response");
    }

    
    await db.insert(scans).values({
      userId: session.userId,
      foodName: nutritionData.food_name || "Unknown Food",
      nutritionJson: JSON.stringify(nutritionData),
      imageHash: hexHash,
      imageUrl: null, 
    });

    return NextResponse.json({ success: true, nutrition: nutritionData });

  } catch (err: any) {
    console.error("Analysis Error:", err);
    return NextResponse.json({ error: err.message || "Analysis failed" }, { status: 500 });
  }
}
