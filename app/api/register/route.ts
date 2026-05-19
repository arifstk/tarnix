// app/api/register/route.ts — User registration with password hashing

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    await connectDB();
    const existing = await User.findOne({ email });
    if (existing)
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 },
      );
    const hashed = await bcrypt.hash(password, 10);
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "user"; // First user is admin
    const user = await User.create({ name, email, password: hashed, role });
    return NextResponse.json(
      { message: "User created", id: user._id },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

