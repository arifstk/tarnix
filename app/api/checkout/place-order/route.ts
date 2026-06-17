// app/api/checkout/place-order/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Product from "@/models/Product";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const session = await getServerSession(authOptions);

    for (const item of body.items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return NextResponse.json(
          { error: `Product "${item.name}" no longer exists.` },
          { status: 404 },
        );
      }

      if (product.status !== "active") {
        return NextResponse.json(
          { error: `Product "${item.name}" is no longer available.` },
          { status: 400 },
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `"${item.name}" only has ${product.stock} unit${
              product.stock !== 1 ? "s" : ""
            } left in stock.`,
          },
          { status: 400 },
        );
      }
    }

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

    await Promise.all(
      body.items.map((item: { productId: string; quantity: number }) =>
        Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: { stock: -item.quantity }, // ← atomic decrement
          },
          { new: true },
        ),
      ),
    );

    return NextResponse.json({ success: true, orderId: order._id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
