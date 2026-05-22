// // app/api/products/route.ts — GET all products, POST new product (with Cloudinary upload)

// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Product from "@/models/Product";
// import { uploadImage } from "@/lib/cloudinary";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../auth/[...nextauth]/route";

// export async function GET() {
//   await connectDB();
//   const products = await Product.find().populate("category").lean();
//   return NextResponse.json(products);
// }

// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);
//   if ((session?.user as any)?.role !== "admin")
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const { name, description, price, category, imageBase64 } = await req.json();
//   await connectDB();
//   const { url, publicId } = await uploadImage(imageBase64);
//   const product = await Product.create({
//     name,
//     description,
//     price,
//     category,
//     imageUrl: url,
//     cloudinaryId: publicId,
//   });
//   return NextResponse.json(product, { status: 201 });
// }

// -----------------------------------------

// app/api/products/route.ts
// GET all products | POST create product (admin only, Cloudinary upload)

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

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    name, description, price, discountRate = 0,
    stock = 0, category, status = "active",
    tags = [], sku = "", imageBase64,
  } = await req.json();

  if (!name || !description || price == null || !category || !imageBase64)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  await connectDB();
  const { url, publicId } = await uploadImage(imageBase64);

  const product = await Product.create({
    name, description, price, discountRate,
    stock, category, status, tags, sku,
    imageUrl: url, cloudinaryId: publicId,
  });

  return NextResponse.json(product, { status: 201 });
}
