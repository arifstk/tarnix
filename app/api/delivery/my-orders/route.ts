// app/api/delivery/my-orders/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import Order from "@/models/Order";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const assignments = await DeliveryAssignment.find({
      deliveryBoyEmail: session.user.email,
    })
      .sort({ acceptedAt: -1 })
      .lean();

    // Attach full order details
    const enriched = await Promise.all(
      assignments.map(async (a) => {
        const order = await Order.findById(a.orderId).lean();
        return { ...a, order };
      }),
    );

    return NextResponse.json({ success: true, assignments: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
