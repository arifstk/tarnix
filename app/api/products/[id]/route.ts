
// app/api/products/[id]/route.ts — GET one, PUT (edit), DELETE product by ID

// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Product from "@/models/Product";
// import { uploadImage, deleteImage } from "@/lib/cloudinary";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../auth/[...nextauth]/route";

// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   const { id } = await params;
//   await connectDB();
//   const product = await Product.findById(id).populate("category");
//   if (!product)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });
//   return NextResponse.json(product);
// }

// export async function PUT(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   const { id } = await params;
//   const session = await getServerSession(authOptions);
//   if ((session?.user as any)?.role !== "admin")
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const body = await req.json();
//   await connectDB();
//   const product = await Product.findById(id);
//   if (!product)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });

//   if (body.imageBase64) {
//     await deleteImage(product.cloudinaryId);
//     const { url, publicId } = await uploadImage(body.imageBase64);
//     body.imageUrl = url;
//     body.cloudinaryId = publicId;
//     delete body.imageBase64;
//   }

//   const updated = await Product.findByIdAndUpdate(id, body, { new: true });
//   return NextResponse.json(updated);
// }

// export async function DELETE(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   const { id } = await params;
//   const session = await getServerSession(authOptions);
//   if ((session?.user as any)?.role !== "admin")
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   await connectDB();
//   const product = await Product.findById(id);
//   if (!product)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });
//   await deleteImage(product.cloudinaryId);
//   await product.deleteOne();
//   return NextResponse.json({ message: "Deleted" });
// }


// ------------------------------------------

// // app/api/products/[id]/route.ts
// // GET single | PUT update (partial, including discount/stock) | DELETE with Cloudinary cleanup

// import { NextResponse }       from "next/server";
// import { connectDB }          from "@/lib/db";
// import Product                from "@/models/Product";
// import { uploadImage, deleteImage } from "@/lib/cloudinary";
// import { getServerSession }   from "next-auth";
// import { authOptions }        from "../../auth/[...nextauth]/route";

// type Params = { params: { id: string } };

// // ── GET single product ─────────────────────────────────────────
// export async function GET(_: Request, { params }: Params) {
//   await connectDB();
//   const product = await Product.findById(params.id)
//     .populate("category", "name slug")
//     .lean();
//   if (!product)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });
//   return NextResponse.json(product);
// }

// // ── PUT update product ─────────────────────────────────────────
// export async function PUT(req: Request, { params }: Params) {
//   const session = await getServerSession(authOptions);
//   if ((session?.user as any)?.role !== "admin")
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const body = await req.json();
//   const {
//     name, description, price, discountRate,
//     stock, category, status, tags, sku, imageBase64,
//   } = body;

//   await connectDB();
//   const existing = await Product.findById(params.id);
//   if (!existing)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });

//   // Build the update payload — only include provided fields
//   const update: Record<string, unknown> = {};
//   if (name        !== undefined) update.name        = name;
//   if (description !== undefined) update.description = description;
//   if (price       !== undefined) update.price       = price;
//   if (discountRate!== undefined) update.discountRate= discountRate;
//   if (stock       !== undefined) update.stock       = stock;
//   if (category    !== undefined) update.category    = category;
//   if (status      !== undefined) update.status      = status;
//   if (tags        !== undefined) update.tags        = tags;
//   if (sku         !== undefined) update.sku         = sku;

//   // If a new image is supplied, replace the Cloudinary asset
//   if (imageBase64) {
//     await deleteImage(existing.cloudinaryId);
//     const { url, publicId } = await uploadImage(imageBase64);
//     update.imageUrl      = url;
//     update.cloudinaryId  = publicId;
//   }

//   // Recompute discountedPrice if price or discount changed
//   const finalPrice        = (price        ?? existing.price)        as number;
//   const finalDiscountRate = (discountRate ?? existing.discountRate) as number;
//   update.discountedPrice  =
//     finalDiscountRate > 0
//       ? parseFloat((finalPrice * (1 - finalDiscountRate / 100)).toFixed(2))
//       : finalPrice;

//   const updated = await Product.findByIdAndUpdate(
//     params.id,
//     { $set: update },
//     { new: true, runValidators: true },
//   ).populate("category", "name slug");

//   return NextResponse.json(updated);
// }

// // ── DELETE product ─────────────────────────────────────────────
// export async function DELETE(_: Request, { params }: Params) {
//   const session = await getServerSession(authOptions);
//   if ((session?.user as any)?.role !== "admin")
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   await connectDB();
//   const product = await Product.findById(params.id);
//   if (!product)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });

//   await deleteImage(product.cloudinaryId);
//   await product.deleteOne();

//   return NextResponse.json({ success: true, id: params.id });
// }

// --------------------------------------------------------------

// app/api/products/[id]/route.ts
// FIX: Changed `{ params }: { params: { id: string } }` → `{ params }: { params: Promise<{ id: string }> }`
// to match Next.js 15 dynamic route typing (same pattern you already use in categories/[id]/route.ts).
// Without this, `params.id` is undefined at runtime in Next.js 15, breaking GET / PUT / DELETE.

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
