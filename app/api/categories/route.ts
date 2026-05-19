// app/api/categories/route.ts — GET all categories, POST new category

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  await connectDB();
  const categories = await Category.find().lean();
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, slug } = await req.json();
  await connectDB();
  const exists = await Category.findOne({ slug });
  if (exists)
    return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
  const category = await Category.create({ name, slug });
  return NextResponse.json(category, { status: 201 });
}

