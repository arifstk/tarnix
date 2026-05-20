// components/admin/AdminDashboard.tsx
// app/admin/dashboard/page.tsx — Admin dashboard with stats cards and quick links

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/login");

  await connectDB();
  const [productCount, categoryCount] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
  ]);

  const stats = [
    { label: "Total Products", value: productCount, href: "/admin/products", color: "indigo" },
    { label: "Total Categories", value: categoryCount, href: "/admin/categories", color: "violet" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-slate-400 mb-8">Welcome back, {session?.user?.name}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500 transition group"
          >
            <p className="text-slate-400 text-sm mb-2">{s.label}</p>
            <p className="text-4xl font-bold text-white group-hover:text-indigo-400 transition">
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="flex gap-4">
        <Link href="/admin/products" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium text-white transition">
          Manage Products
        </Link>
        <Link href="/admin/categories" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium text-white transition">
          Manage Categories
        </Link>
      </div>
    </div>
  );
}

