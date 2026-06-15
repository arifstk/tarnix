// app/api/delivery/accept-order/route.ts
// CHANGELOG: Delivery boy accepts a shipped order — creates assignment + notifies admin

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import { authOptions } from "../../auth/[...nextauth]/route";
// import Notification from "@/models/Notification";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { orderId } = await req.json();

    // Check order exists and is shipped
    const order = await Order.findOne({ _id: orderId, orderStatus: "shipped" });
    if (!order) {
      return NextResponse.json(
        { error: "Order not found or not available" },
        { status: 404 },
      );
    }

    // Check not already accepted
    const existing = await DeliveryAssignment.findOne({ orderId });
    if (existing) {
      return NextResponse.json(
        { error: "Order already accepted by another delivery boy" },
        { status: 400 },
      );
    }

    // Create assignment
    const assignment = await DeliveryAssignment.create({
      orderId,
      deliveryBoyEmail: session.user.email,
      deliveryBoyName: session.user.name || "Delivery Boy",
      status: "accepted",
    });

    // Update order status to processing
    order.orderStatus = "processing";
    await order.save();

    // Create admin notification
    // await Notification.create({
    //   type: "delivery_accepted",
    //   title: "Order Accepted for Delivery",
    //   message: `${session.user.name || "A delivery boy"} accepted order #${orderId.toString().slice(-6).toUpperCase()} for delivery.`,
    //   orderId,
    //   read: false,
    // });

    return NextResponse.json({ success: true, assignment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
