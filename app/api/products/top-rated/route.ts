// app/api/products/top-rated/route.ts
// CHANGELOG: Returns top rated products sorted by rating DESC,
//            minimum ratingCount filter to avoid single-review bias

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import "@/models/Category";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "8");
    const minRatings = parseInt(searchParams.get("minRatings") || "1");

    // ── Fetch top rated active products ──────────────────────
    const products = await Product.find({
      status: "active",
      rating: { $gt: 0 },
      ratingCount: { $gte: minRatings }, // at least N reviews
    })
      .sort({ rating: -1, ratingCount: -1 }) // sort by rating, break ties by count
      .limit(limit)
      .populate("category", "name")
      .lean();

    // ── Attach sold count from delivered orders ───────────────
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
          { $group: { _id: null, totalSold: { $sum: "$items.quantity" } } },
        ]);
        const totalSold = soldResult[0]?.totalSold || 0;
        return { product: p, totalSold };
      }),
    );

    return NextResponse.json({ success: true, products: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
