// app/api/admin/orders/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(_: NextRequest, { params }: { params: Promise <{ id: string }> }) {
  try {
    await dbConnect();
    const {id} = await params;
    const order = await Order.findById(id).lean();
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

