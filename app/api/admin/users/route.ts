// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";

export async function GET() {
  try {
    await dbConnect();

    const users = await User.find()
      .select("name email image role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Attach order count per user
    const enriched = await Promise.all(
      users.map(async (u) => {
        const orderCount = await Order.countDocuments({ userEmail: u.email });
        return {
          _id: u._id.toString(),
          name: u.name,
          email: u.email,
          image: u.image || null,
          role: u.role,
          orderCount,
          createdAt: u.createdAt,
          // Avatar initials — first letter of each word
          avatar: u.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
          // Joined date
          joined: new Date(u.createdAt as Date).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
        };
      }),
    );

    return NextResponse.json({ success: true, users: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const { userId, role } = await req.json();

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    ).select("name email role");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { userId } = await req.json();

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

