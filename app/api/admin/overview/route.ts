// app/api/admin/overview/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import "@/models/Category";

// Minimal User model reference — adjust to your actual User model path
let User: any;
try {
  User = require("@/models/User").default;
} catch {}

export async function GET() {
  try {
    await dbConnect();

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // ── Core counts ──
    const [
      totalOrdersCount,
      totalProductsCount,
      totalUsersCount,
      thisMonthOrders,
      lastMonthOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User ? User.countDocuments() : Promise.resolve(0),
      Order.find({ createdAt: { $gte: thisMonth } }).lean(),
      Order.find({ createdAt: { $gte: lastMonth, $lt: thisMonth } }).lean(),
    ]);

    // ── Revenue ──
    const totalRevenue = (
      await Order.find({ paymentStatus: "paid" }).lean()
    ).reduce((s: number, o: any) => s + (o.total || 0), 0);
    const thisMonthRev = thisMonthOrders
      .filter((o: any) => o.paymentStatus === "paid")
      .reduce((s: number, o: any) => s + (o.total || 0), 0);
    const lastMonthRev = lastMonthOrders
      .filter((o: any) => o.paymentStatus === "paid")
      .reduce((s: number, o: any) => s + (o.total || 0), 0);
    const revenueGrowth =
      lastMonthRev > 0
        ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100)
        : 0;

    // ── Monthly revenue chart (last 6 months) ──
    const monthlyRevenue = await Promise.all(
      Array.from({ length: 6 }).map(async (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const end = new Date(
          now.getFullYear(),
          now.getMonth() - (5 - i) + 1,
          1,
        );
        const label = d.toLocaleString("default", { month: "short" });
        const orders = await Order.find({
          createdAt: { $gte: d, $lt: end },
          paymentStatus: "paid",
        }).lean();
        const revenue = orders.reduce(
          (s: number, o: any) => s + (o.total || 0),
          0,
        );
        return { month: label, revenue: Math.round(revenue) };
      }),
    );

    // ── Weekly orders chart (last 7 days) ──
    const weeklyOrders = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);
        const label = d.toLocaleString("default", { weekday: "short" });
        const count = await Order.countDocuments({
          createdAt: { $gte: d, $lte: end },
        });
        return { day: label, orders: count };
      }),
    );

    // ── Order status breakdown ──
    const statusBreakdown = await Promise.all(
      [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ].map(async (s) => ({
        status: s,
        count: await Order.countDocuments({ orderStatus: s }),
      })),
    );

    // ── Recent orders ──
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // ── Low stock products ──
    const lowStock = await Product.find({
      stock: { $lt: 10 },
      status: "active",
    })
      .select("name stock images")
      .limit(5)
      .lean();

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue),
        thisMonthRev: Math.round(thisMonthRev),
        revenueGrowth,
        totalOrders: totalOrdersCount,
        thisMonthOrders: thisMonthOrders.length,
        totalProducts: totalProductsCount,
        totalUsers: totalUsersCount,
      },
      monthlyRevenue,
      weeklyOrders,
      statusBreakdown,
      recentOrders: JSON.parse(JSON.stringify(recentOrders)),
      lowStock: JSON.parse(JSON.stringify(lowStock)),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
