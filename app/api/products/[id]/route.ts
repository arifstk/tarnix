// // app/api/products/[id]/route.ts

// import { NextResponse }             from "next/server";
// import { connectDB }                from "@/lib/db";
// import Product                      from "@/models/Product";
// import { uploadImage, deleteImage } from "@/lib/cloudinary";
// import { getServerSession }         from "next-auth";
// import { authOptions }              from "../../auth/[...nextauth]/route";

// // ── GET single product ─────────────────────────────────────────
// export async function GET(
//   _: Request,
//   { params }: { params: Promise<{ id: string }> }  // FIX: Promise<>
// ) {
//   const { id } = await params;                       // FIX: await params
//   await connectDB();
//   const product = await Product.findById(id)
//     .populate("category", "name slug")
//     .lean();
//   if (!product)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });
//   return NextResponse.json(product);
// }

// // ── PUT update product ─────────────────────────────────────────
// export async function PUT(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }  // FIX: Promise<>
// ) {
//   const session = await getServerSession(authOptions);
//   if ((session?.user as any)?.role !== "admin")
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const { id } = await params;                       // FIX: await params
//   const body = await req.json();
//   const {
//     name, description, price, discountRate,
//     stock, category, status, tags, sku, imageBase64,
//   } = body;

//   await connectDB();
//   const existing = await Product.findById(id);
//   if (!existing)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });

//   // Build partial update — only include fields that were sent
//   const update: Record<string, unknown> = {};
//   if (name         !== undefined) update.name         = name;
//   if (description  !== undefined) update.description  = description;
//   if (price        !== undefined) update.price        = price;
//   if (discountRate !== undefined) update.discountRate = discountRate;
//   if (stock        !== undefined) update.stock        = stock;
//   if (category     !== undefined) update.category     = category;
//   if (status       !== undefined) update.status       = status;
//   if (tags         !== undefined) update.tags         = tags;
//   if (sku          !== undefined) update.sku          = sku;

//   // Replace Cloudinary image only if a new base64 image was sent
//   if (imageBase64) {
//     if (existing.cloudinaryId) await deleteImage(existing.cloudinaryId);
//     const { url, publicId } = await uploadImage(imageBase64);
//     update.imageUrl     = url;
//     update.cloudinaryId = publicId;
//   }

//   // Recompute discountedPrice so it stays in sync
//   const finalPrice        = (price        ?? existing.price)        as number;
//   const finalDiscountRate = (discountRate ?? existing.discountRate) as number;
//   update.discountedPrice  =
//     finalDiscountRate > 0
//       ? parseFloat((finalPrice * (1 - finalDiscountRate / 100)).toFixed(2))
//       : finalPrice;

//   const updated = await Product.findByIdAndUpdate(
//     id,
//     { $set: update },
//     { new: true, runValidators: true },
//   ).populate("category", "name slug");

//   return NextResponse.json(updated);
// }

// // ── DELETE product ─────────────────────────────────────────────
// export async function DELETE(
//   _: Request,
//   { params }: { params: Promise<{ id: string }> }  // FIX: Promise<>
// ) {
//   const session = await getServerSession(authOptions);
//   if ((session?.user as any)?.role !== "admin")
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const { id } = await params;                       // FIX: await params
//   await connectDB();
//   const product = await Product.findById(id);
//   if (!product)
//     return NextResponse.json({ error: "Not found" }, { status: 404 });

//   if (product.cloudinaryId) await deleteImage(product.cloudinaryId);
//   await product.deleteOne();

//   return NextResponse.json({ success: true, id });
// }


// ---------------------------------------------

// app/api/products/[id]/route.ts
import { NextResponse }             from "next/server";
import { connectDB }                from "@/lib/db";
import Product                      from "@/models/Product";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { getServerSession }         from "next-auth";
import { authOptions }              from "../../auth/[...nextauth]/route";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();
  const product = await Product.findById(id)
    .populate("category", "name slug")
    .lean();
  if (!product)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const {
    name, description, price, discountRate,
    stock, category, status, tags, sku,
    // CHANGELOG: receive up to 4 base64 strings; null means "keep existing slot"
    imagesBase64,
    // CHANGELOG: optional manual rating override
    rating, ratingCount,
  } = body;

  await connectDB();
  const existing = await Product.findById(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

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
  if (rating       !== undefined) update.rating       = rating;
  if (ratingCount  !== undefined) update.ratingCount  = ratingCount;

  // CHANGELOG: multi-image update logic
  // imagesBase64 is an array of up to 4 items.
  // Each slot is either a new base64 string (upload it), or null (keep existing).
  // Slots removed from the end are deleted from Cloudinary.
  if (Array.isArray(imagesBase64)) {
    const currentImages: { url: string; cloudinaryId: string }[] =
      existing.images ?? [];

    const nextImages: { url: string; cloudinaryId: string }[] = [];

    for (let i = 0; i < imagesBase64.length; i++) {
      const b64 = imagesBase64[i];
      if (b64) {
        // New image for this slot — delete old one if it existed
        if (currentImages[i]?.cloudinaryId) {
          await deleteImage(currentImages[i].cloudinaryId);
        }
        const { url, publicId } = await uploadImage(b64);
        nextImages.push({ url, cloudinaryId: publicId });
      } else if (currentImages[i]) {
        // null passed — keep the existing image at this slot
        nextImages.push(currentImages[i]);
      }
      // If neither: slot was empty before and no new image — skip
    }

    // Delete any old images that were at slots beyond the new array length
    for (let i = imagesBase64.length; i < currentImages.length; i++) {
      if (currentImages[i]?.cloudinaryId) {
        await deleteImage(currentImages[i].cloudinaryId);
      }
    }

    update.images = nextImages;
  }

  // Recompute discountedPrice
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

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const product = await Product.findById(id);
  if (!product)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // CHANGELOG: delete all images from Cloudinary, not just one
  for (const img of product.images ?? []) {
    if (img.cloudinaryId) await deleteImage(img.cloudinaryId);
  }

  await product.deleteOne();
  return NextResponse.json({ success: true, id });
}

