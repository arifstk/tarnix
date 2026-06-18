// app/api/products/new-arrivals/route.ts
// CHANGELOG: Returns latest active products sorted by createdAt DESC

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import "@/models/Category";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    // ── Fetch latest active products ──────────────────────────
    const products = await Product.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("category", "name")
      .lean();

    // ── Attach sold count per product ─────────────────────────
    const enriched = await Promise.all(
      products.map(async (p) => {
        const soldResult = await Order.aggregate([
          {
            $match: {
              orderStatus: {
                $in: ["confirmed", "processing", "shipped", "delivered"],
              },
            },
          },
          { $unwind: "$items" },
          { $match: { "items.productId": p._id } },
          {
            $group: {
              _id: null,
              totalSold: { $sum: "$items.quantity" },
            },
          },
        ]);

        // Days since created
        const daysAgo = Math.floor(
          (Date.now() - new Date(p.createdAt as Date).getTime()) /
            (1000 * 60 * 60 * 24),
        );

        return {
          product: p,
          totalSold: soldResult[0]?.totalSold || 0,
          daysAgo,
        };
      }),
    );

    return NextResponse.json({ success: true, products: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

