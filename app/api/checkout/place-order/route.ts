// app/api/checkout/place-order/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const session = await getServerSession(authOptions);

    const order = await Order.create({
      userEmail: session?.user?.email || null,
      items: body.items,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentMethod === "cod" ? "pending" : "paid",
      orderStatus: "confirmed",
      stripePaymentIntentId: body.stripePaymentIntentId || undefined,
      subtotal: body.subtotal,
      total: body.total,
    });

    return NextResponse.json({ success: true, orderId: order._id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}