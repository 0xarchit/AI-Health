import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactLogs } from "@/db/schema";
import { eq, gt, count } from "drizzle-orm";

import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token");
    const refreshToken = cookieStore.get("refresh_token");

    if (!sessionToken && !refreshToken) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { name, surname, email, telegram, type, message } = await req.json();

    
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.endsWith("@gmail.com")) {
      return NextResponse.json({ error: "Only @gmail.com addresses are allowed." }, { status: 400 });
    }

    if (email.includes("+")) {
      return NextResponse.json({ error: "Email aliases (using '+') are not allowed." }, { status: 400 });
    }

    if (!type || !message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    
    
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-vercel-forwarded-for") || req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentLogs = await db.select().from(contactLogs).where(
        gt(contactLogs.createdAt, oneHourAgo)
    );
    
    const ipLogs = recentLogs.filter(log => log.ip === ip);

    if (ipLogs.length >= 3) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    
    await db.insert(contactLogs).values({
      ip: ip,
      type: type,
      name: name,
      surname: surname || null,
      email: email,
      telegram: telegram || null,
      message: message,
    });

    
    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    if (!botToken || !chatId) {
      console.error("Telegram credentials missing");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const telegramMessage = `
🔔 *New Contact Submission*

*Type:* ${type}
*Name:* ${name} ${surname ? surname : ""}
*Email:* ${email}
*Telegram:* ${telegram ? `@${telegram}` : "Not provided"}

*Message:*
${message}

_IP: ${ip}_
    `;

    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: "Markdown",
      }),
    });

    if (!telegramRes.ok) {
        const errorText = await telegramRes.text();
        console.error("Telegram API Error:", errorText);
        throw new Error("Failed to send notification");
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
