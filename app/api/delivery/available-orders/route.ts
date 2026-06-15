// app/api/delivery/available-orders/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find all orders with status "shipped"
    const shippedOrders = await Order.find({ orderStatus: "shipped" }).lean();

    // Find already accepted order IDs
    const assignments = await DeliveryAssignment.find()
      .select("orderId")
      .lean();
    const acceptedIds = new Set(assignments.map((a) => a.orderId.toString()));

    // Filter out already accepted orders
    const available = shippedOrders.filter(
      (o) => !acceptedIds.has(o._id.toString()),
    );

    return NextResponse.json({ success: true, orders: available });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

