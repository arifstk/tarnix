// app/api/contact/route.ts
// CHANGELOG: POST saves contact message to MongoDB

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, email, subject, message } = await req.json();

    // ── Validate ───────────────────────────────────
    if (!name?.trim())
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    if (!email?.trim())
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    if (!subject?.trim())
      return NextResponse.json(
        { error: "Subject is required." },
        { status: 400 },
      );
    if (!message?.trim())
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }

    await ContactMessage.create({ name, email, subject, message });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

