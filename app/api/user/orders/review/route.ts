// app/api/user/orders/review/route.ts
// CHANGELOG: POST a review for a product inside a delivered order

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { orderId, productId, rating, comment } = await req.json();

    // Security: only the order owner can review
    const order = await Order.findOne({
      _id: orderId,
      userEmail: session.user.email,
      orderStatus: "delivered",
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or not delivered yet" },
        { status: 404 }
      );
    }

    // Check not already reviewed
    const alreadyReviewed = order.reviews.find(
      (r: any) => r.productId.toString() === productId
    );
    if (alreadyReviewed) {
      return NextResponse.json(
        { error: "You already reviewed this product" },
        { status: 400 }
      );
    }

    // Add review to order
    order.reviews.push({ productId, rating, comment, submittedAt: new Date() });
    await order.save();

    // Update product rating average
    const product = await Product.findById(productId);
    if (product) {
      const newCount  = (product.ratingCount || 0) + 1;
      const newRating = ((product.rating || 0) * (newCount - 1) + rating) / newCount;
      product.rating      = Math.round(newRating * 10) / 10;
      product.ratingCount = newCount;
      await product.save();
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

