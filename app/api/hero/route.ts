// app/api/hero/route.ts
// CHANGELOG: Public GET — returns active banners sorted by order

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import HeroBanner from "@/models/HeroBanner";

export async function GET() {
  try {
    await dbConnect();
    const banners = await HeroBanner.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, banners });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
