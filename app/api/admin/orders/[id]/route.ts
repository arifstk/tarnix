// app/api/admin/orders/[id]/route.ts
// CHANGELOG: GET single order details by ID

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const order = await Order.findById(params.id).lean();
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

