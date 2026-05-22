// app/api/products/[id]/route.ts

import { NextResponse }             from "next/server";
import { connectDB }                from "@/lib/db";
import Product                      from "@/models/Product";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { getServerSession }         from "next-auth";
import { authOptions }              from "../../auth/[...nextauth]/route";

// ── GET single product ─────────────────────────────────────────
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }  // FIX: Promise<>
) {
  const { id } = await params;                       // FIX: await params
  await connectDB();
  const product = await Product.findById(id)
    .populate("category", "name slug")
    .lean();
  if (!product)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

// ── PUT update product ─────────────────────────────────────────
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }  // FIX: Promise<>
) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;                       // FIX: await params
  const body = await req.json();
  const {
    name, description, price, discountRate,
    stock, category, status, tags, sku, imageBase64,
  } = body;

  await connectDB();
  const existing = await Product.findById(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Build partial update — only include fields that were sent
  const update: Record<string, unknown> = {};
  if (name         !== undefined) update.name         = name;
  if (description  !== undefined) update.description  = description;
  if (price        !== undefined) update.price        = price;
  if (discountRate !== undefined) update.discountRate = discountRate;
  if (stock        !== undefined) update.stock        = stock;
  if (category     !== undefined) update.category     = category;
  if (status       !== undefined) update.status       = status;
  if (tags         !== undefined) update.tags         = tags;
  if (sku          !== undefined) update.sku          = sku;

  // Replace Cloudinary image only if a new base64 image was sent
  if (imageBase64) {
    if (existing.cloudinaryId) await deleteImage(existing.cloudinaryId);
    const { url, publicId } = await uploadImage(imageBase64);
    update.imageUrl     = url;
    update.cloudinaryId = publicId;
  }

  // Recompute discountedPrice so it stays in sync
  const finalPrice        = (price        ?? existing.price)        as number;
  const finalDiscountRate = (discountRate ?? existing.discountRate) as number;
  update.discountedPrice  =
    finalDiscountRate > 0
      ? parseFloat((finalPrice * (1 - finalDiscountRate / 100)).toFixed(2))
      : finalPrice;

  const updated = await Product.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true, runValidators: true },
  ).populate("category", "name slug");

  return NextResponse.json(updated);
}

// ── DELETE product ─────────────────────────────────────────────
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }  // FIX: Promise<>
) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;                       // FIX: await params
  await connectDB();
  const product = await Product.findById(id);
  if (!product)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (product.cloudinaryId) await deleteImage(product.cloudinaryId);
  await product.deleteOne();

  return NextResponse.json({ success: true, id });
}
