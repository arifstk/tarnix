// app/api/products/route.ts

import { NextResponse } from "next/server";
import { connectDB }    from "@/lib/db";
import Product          from "@/models/Product";
import { uploadImage }  from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions }  from "../auth/[...nextauth]/route";

export async function GET() {
  await connectDB();
  const products = await Product.find()
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json(products);
}

// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);
//   if ((session?.user as any)?.role !== "admin")
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const {
//     name, description, price, discountRate = 0,
//     stock = 0, category, status = "active",
//     tags = [], sku = "", imageBase64,
//   } = await req.json();

//   if (!name || !description || price == null || !category || !imageBase64)
//     return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

//   await connectDB();
//   const { url, publicId } = await uploadImage(imageBase64);

//   const product = await Product.create({
//     name, description, price, discountRate,
//     stock, category, status, tags, sku,
//     imageUrl: url, cloudinaryId: publicId,
//   });

//   return NextResponse.json(product, { status: 201 });
// }


// CHANGELOG: imageBase64 → imagesBase64[]; store as images array
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    name, description, price, discountRate = 0,
    stock = 0, category, status = "active",
    tags = [], sku = "",
    imagesBase64 = [],          // CHANGELOG: array instead of single string
    rating = 0, ratingCount = 0,
  } = await req.json();

  if (!name || !description || price == null || !category || !imagesBase64[0])
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  await connectDB();

  // Upload all provided images; [0] becomes the main image
  const images: { url: string; cloudinaryId: string }[] = [];
  for (const b64 of imagesBase64.slice(0, 4)) {
    if (b64) {
      const { url, publicId } = await uploadImage(b64);
      images.push({ url, cloudinaryId: publicId });
    }
  }

  const product = await Product.create({
    name, description, price, discountRate,
    stock, category, status, tags, sku,
    images,                     // CHANGELOG: array
    rating, ratingCount,
  });

  return NextResponse.json(product, { status: 201 });
}