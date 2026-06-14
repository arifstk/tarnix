// app/api/products/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { uploadImage } from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import "@/models/Category";

export async function GET() {
  await connectDB();
  const products = await Product.find()
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json(products);
}

// app/api/products/route.ts

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    name,
    description,
    price,
    discountRate = 0,
    stock = 0,
    category,
    status = "active",
    tags = [],
    sku = "",
    imagesBase64 = [],
  } = body;

  // ── CHANGELOG: FORCE HARD NUMBERS TO PREVENT BLANK STRING INJECTION ──
  // This cleanses form state garbage like "" or "4" into absolute numbers
  const sanitizedRating =
    body.rating && !isNaN(Number(body.rating)) ? Number(body.rating) : 0;
  const sanitizedRatingCount =
    body.ratingCount && !isNaN(Number(body.ratingCount))
      ? Number(body.ratingCount)
      : 0;
  // ─────────────────────────────────────────────────────────────────────

  if (!name || !description || price == null || !category || !imagesBase64[0])
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );

  await connectDB();

  // Upload all provided images; [0] becomes the main image
  const images: { url: string; cloudinaryId: string }[] = [];
  for (const b64 of imagesBase64.slice(0, 4)) {
    if (b64) {
      const { url, publicId } = await uploadImage(b64);
      images.push({ url, cloudinaryId: publicId });
    }
  }

  // Use the sanitized numeric properties down here
  const product = await Product.create({
    name,
    description,
    price,
    discountRate,
    stock,
    category,
    status,
    tags,
    sku,
    images,
    rating: sanitizedRating, // Fixed variable
    ratingCount: sanitizedRatingCount, // Fixed variable
  });

  return NextResponse.json(product, { status: 201 });
}
