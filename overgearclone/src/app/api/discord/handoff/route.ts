import { NextResponse } from "next/server";
import axios from "axios";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Send the message to Discord via the webhook
    const discordResponse = await axios.post(DISCORD_WEBHOOK_URL, {
      content: message,
    });

    return NextResponse.json({ success: true, data: discordResponse.data });
  } catch (error) {
    console.error("Error sending Discord webhook:", error);
    return NextResponse.json({ error: "Failed to send Discord message" }, { status: 500 });
  }
}
