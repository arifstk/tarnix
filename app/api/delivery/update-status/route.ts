// app/api/delivery/update-status/route.ts
// CHANGELOG: Delivery boy updates delivery progress status

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import { authOptions } from "../../auth/[...nextauth]/route";
// import Notification from "@/models/Notification";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { orderId, status } = await req.json();

    // Only the assigned delivery boy can update
    const assignment = await DeliveryAssignment.findOne({
      orderId,
      deliveryBoyEmail: session.user.email,
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 },
      );
    }

    // Update assignment status
    assignment.status = status;
    if (status === "delivered") assignment.deliveredAt = new Date();
    await assignment.save();

    // Sync order status
    const orderStatusMap: Record<string, string> = {
      accepted: "processing",
      "picked-up": "processing",
      "on-the-way": "shipped",
      delivered: "delivered",
    };

    // await Order.findByIdAndUpdate(orderId, {
    //   orderStatus: orderStatusMap[status] || "processing",
    // });

    // Notify admin when delivered
    // if (status === "delivered") {
    //   await Notification.create({
    //     type: "delivery_completed",
    //     title: "Order Delivered Successfully",
    //     message: `Order #${orderId.toString().slice(-6).toUpperCase()} has been delivered by ${session.user.name}.`,
    //     orderId,
    //     read: false,
    //   });
    // }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.orderStatus = orderStatusMap[status] || "processing";

    // ── KEY: when delivered, mark payment as paid (covers COD) ──
    if (status === "delivered") {
      order.paymentStatus = "paid";
    }

    await order.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
