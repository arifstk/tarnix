// app/api/admin/messages/route.ts
// CHANGELOG: GET all messages, PATCH mark as read, DELETE message

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";

export async function GET() {
  try {
    await dbConnect();
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    const unreadCount = await ContactMessage.countDocuments({ read: false });
    return NextResponse.json({ success: true, messages, unreadCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const { id, read, repliedAt } = await req.json();

    const update: Record<string, any> = {};
    if (read !== undefined) update.read = read;
    if (repliedAt !== undefined) update.repliedAt = repliedAt;

    await ContactMessage.findByIdAndUpdate(id, update);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { id } = await req.json();
    await ContactMessage.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

