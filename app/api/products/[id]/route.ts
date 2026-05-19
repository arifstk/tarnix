// app/api/products/[id]/route.ts — GET one, PUT (edit), DELETE product by ID

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const product = await Product.findById(params.id).populate("category");
  if (!product)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectDB();
  const product = await Product.findById(params.id);
  if (!product)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.imageBase64) {
    await deleteImage(product.cloudinaryId);
    const { url, publicId } = await uploadImage(body.imageBase64);
    body.imageUrl = url;
    body.cloudinaryId = publicId;
    delete body.imageBase64;
  }

  const updated = await Product.findByIdAndUpdate(params.id, body, {
    new: true,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const product = await Product.findById(params.id);
  if (!product)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await deleteImage(product.cloudinaryId);
  await product.deleteOne();
  return NextResponse.json({ message: "Deleted" });
}

