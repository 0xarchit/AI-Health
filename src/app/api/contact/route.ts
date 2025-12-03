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

    
    
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentLogs = await db.select().from(contactLogs).where(
        gt(contactLogs.createdAt, oneHourAgo)
    );
    
    const ipLogs = recentLogs.filter(log => log.ip === ip);

    if (ipLogs.length >= 3) {
      return NextResponse.json({ error: "Too many requests from your ip. Please try again later." }, { status: 429 });
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

    const escapeHtml = (str: string) => {
      if (!str) return "";
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    
    
    const truncateMessage = (str: string, maxLength: number = 3500) => {
        if (!str) return "";
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + "... (truncated)";
    };

    const telegramMessageHtml = `
<b>🔔 New Contact Submission</b>

<b>Type:</b> ${escapeHtml(type)}
<b>Name:</b> ${escapeHtml(name)} ${surname ? escapeHtml(surname) : ""}
<b>Email:</b> ${escapeHtml(email)}
<b>Telegram:</b> ${telegram ? `@${escapeHtml(telegram)}` : "Not provided"}

<b>Message:</b>
${escapeHtml(truncateMessage(message))}

<i>IP: ${escapeHtml(ip)}</i>
    `;

    try {
        const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: telegramMessageHtml,
                parse_mode: "HTML",
            }),
        });

        if (!telegramRes.ok) {
            const errorText = await telegramRes.text();
            console.error("Telegram HTML API Error:", errorText);
            throw new Error("HTML message failed");
        }
    } catch (error) {
        console.error("Failed to send HTML message, falling back to plain text:", error);
        
        
        const telegramMessagePlain = `
🔔 New Contact Submission

Type: ${type}
Name: ${name} ${surname || ""}
Email: ${email}
Telegram: ${telegram || "Not provided"}

Message:
${truncateMessage(message)}

IP: ${ip}
        `;

        try {
            const fallbackRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: telegramMessagePlain,
                    
                }),
            });

            if (!fallbackRes.ok) {
                const errorText = await fallbackRes.text();
                console.error("Telegram Plain Text API Error:", errorText);
            }
        } catch (fallbackError) {
            console.error("Failed to send fallback message:", fallbackError);
        }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
