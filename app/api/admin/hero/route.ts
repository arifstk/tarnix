// app/api/admin/hero/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import HeroBanner from "@/models/HeroBanner";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── GET all banners (admin — includes inactive) ──
export async function GET() {
  try {
    await dbConnect();
    const banners = await HeroBanner.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, banners });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST create new banner ──
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const banner = await HeroBanner.create({
      title: body.title,
      description: body.description,
      image: body.image,
      cloudinaryId: body.cloudinaryId || "",
      buttonText: body.buttonText || "Shop Now",
      buttonLink: body.buttonLink || "/products",
      order: body.order ?? 0,
      active: body.active ?? true,
    });

    return NextResponse.json({ success: true, banner });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── PATCH update banner ──
export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const { id, ...updates } = await req.json();

    const banner = await HeroBanner.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, banner });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── DELETE banner ──
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { id } = await req.json();

    const banner = await HeroBanner.findById(id);
    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    // Delete image from Cloudinary if exists
    if (banner.cloudinaryId) {
      await cloudinary.uploader.destroy(banner.cloudinaryId);
    }

    await HeroBanner.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
