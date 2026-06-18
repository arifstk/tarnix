// app/api/products/top-selling/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import "@/models/Category";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "8");

    // ── Aggregate delivered orders to find top sold products ──
    const topProducts = await Order.aggregate([
      // Only count delivered orders
      { $match: { orderStatus: "delivered" } },

      // Unwind items array so each item is a separate doc
      { $unwind: "$items" },

      // Group by productId and sum total quantity sold
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },

      // Sort by most sold
      { $sort: { totalSold: -1 } },

      // Limit results
      { $limit: limit },

      // Join with products collection
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },

      // Flatten the joined product array
      { $unwind: "$product" },

      // Only include active products
      { $match: { "product.status": "active" } },

      // Join with categories
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "product.categoryData",
        },
      },

      // Shape the output
      {
        $project: {
          _id: 0,
          productId: "$_id",
          totalSold: 1,
          totalRevenue: 1,
          product: {
            _id: "$product._id",
            name: "$product.name",
            description: "$product.description",
            price: "$product.price",
            discountRate: "$product.discountRate",
            discountedPrice: "$product.discountedPrice",
            stock: "$product.stock",
            images: "$product.images",
            tags: "$product.tags",
            rating: "$product.rating",
            ratingCount: "$product.ratingCount",
            status: "$product.status",
            category: {
              $cond: {
                if: { $gt: [{ $size: "$product.categoryData" }, 0] },
                then: { $arrayElemAt: ["$product.categoryData", 0] },
                else: null,
              },
            },
          },
        },
      },
    ]);

    return NextResponse.json({ success: true, products: topProducts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
