// components/admin/OverviewSection.tsx

"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// ─── Types ─────────────
interface Stats {
  totalRevenue: number;
  thisMonthRev: number;
  revenueGrowth: number;
  totalOrders: number;
  thisMonthOrders: number;
  totalProducts: number;
  totalUsers: number;
}

interface MonthlyRevenue { month: string; revenue: number; }
interface WeeklyOrders { day: string; orders: number; }
interface StatusBreakdown { status: string; count: number; }

interface RecentOrder {
  _id: string;
  shippingAddress: { fullName: string };
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

interface LowStockProduct {
  _id: string;
  name: string;
  stock: number;
  images: { url: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-2xl p-5 ${className}`}
    style={{ background: "linear-gradient(145deg,#141b2d,#0f1420)", border: "1px solid rgba(255,255,255,0.06)" }}
  >
    {children}
  </div>
);

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-white/4 rounded-xl ${className}`} />
);

const orderColors: Record<string, string> = {
  pending: "bg-slate-500/15   text-slate-300   border-slate-500/25",
  confirmed: "bg-indigo-500/15  text-indigo-300  border-indigo-500/25",
  processing: "bg-amber-500/15   text-amber-300   border-amber-500/25",
  shipped: "bg-sky-500/15     text-sky-300     border-sky-500/25",
  delivered: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  cancelled: "bg-rose-500/15    text-rose-300    border-rose-500/25",
};

const paymentColors: Record<string, string> = {
  pending: "text-amber-400",
  paid: "text-emerald-400",
  failed: "text-rose-400",
};

const statusIcons: Record<string, string> = {
  pending: "🕐", confirmed: "✅", processing: "⚙️",
  shipped: "🚚", delivered: "🎉", cancelled: "✕",
};

const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-indigo-400 font-bold">${payload[0].value.toLocaleString()}</p>
    </div>
  );
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-indigo-400 font-bold">{payload[0].value} orders</p>
    </div>
  );
};

// Main ══════════════════════════════════════════════════
export default function OverviewSection() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [weeklyOrders, setWeeklyOrders] = useState<WeeklyOrders[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setMonthlyRevenue(data.monthlyRevenue);
          setWeeklyOrders(data.weeklyOrders);
          setStatusBreakdown(data.statusBreakdown);
          setRecentOrders(data.recentOrders);
          setLowStock(data.lowStock);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const STAT_CARDS = [
    {
      label: "Total Revenue",
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : "—",
      sub: stats ? `${stats.revenueGrowth >= 0 ? "+" : ""}${stats.revenueGrowth}% vs last month` : "",
      icon: "💰",
      accent: "from-indigo-500 to-violet-600",
      glow: "shadow-indigo-500/20",
      positive: (stats?.revenueGrowth ?? 0) >= 0,
    },
    {
      label: "Total Orders",
      value: stats ? stats.totalOrders.toLocaleString() : "—",
      sub: stats ? `+${stats.thisMonthOrders} this month` : "",
      icon: "📦",
      accent: "from-sky-500 to-cyan-500",
      glow: "shadow-sky-500/20",
      positive: true,
    },
    {
      label: "Total Users",
      value: stats ? stats.totalUsers.toLocaleString() : "—",
      sub: "Registered accounts",
      icon: "👥",
      accent: "from-emerald-500 to-teal-500",
      glow: "shadow-emerald-500/20",
      positive: true,
    },
    {
      label: "Products",
      value: stats ? stats.totalProducts.toLocaleString() : "—",
      sub: lowStock.length > 0 ? `${lowStock.length} low stock` : "All stocked",
      icon: "🛒",
      accent: "from-amber-500 to-orange-500",
      glow: "shadow-amber-500/20",
      positive: lowStock.length === 0,
    },
  ];

  const maxOrders = Math.max(...weeklyOrders.map((d) => d.orders), 1);

  return (
    <div className="space-y-6">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <Card key={s.label} className={`shadow-xl ${s.glow} relative overflow-hidden group`}>
            <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${s.accent} flex items-center justify-center text-lg mb-4 shadow-lg`}>
              {s.icon}
            </div>
            {loading ? (
              <>
                <Skeleton className="h-7 w-24 mb-1" />
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </>
            ) : (
              <>
                <p className="text-2xl font-black text-white tracking-tight">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</p>
                <p className={`text-xs font-semibold mt-2 ${s.positive ? "text-emerald-400" : "text-rose-400"}`}>
                  {s.positive ? "↑" : "↓"} {s.sub}
                </p>
              </>
            )}
            <div className={`absolute -bottom-5 -right-5 w-24 h-24 rounded-full bg-linear-to-br ${s.accent} opacity-8 blur-xl group-hover:opacity-15 transition-opacity duration-300`} />
          </Card>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Revenue chart */}
        <Card>
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white">Revenue (6 months)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {loading ? "Loading…" : `$${stats?.thisMonthRev.toLocaleString()} this month`}
            </p>
          </div>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyRevenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomLineTooltip />} />
                <Line
                  type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5}
                  dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6, fill: "#818cf8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Weekly orders chart */}
        <Card>
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white">Orders This Week</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {loading ? "Loading…" : `${weeklyOrders.reduce((s, d) => s + d.orders, 0)} total this week`}
            </p>
          </div>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyOrders} barSize={24} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                  {weeklyOrders.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.orders === maxOrders ? "#6366f1" : "rgba(99,102,241,0.35)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── Order Status Breakdown ── */}
      <Card>
        <h2 className="text-sm font-bold text-white mb-4">Order Status Breakdown</h2>
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {statusBreakdown.map((s) => (
              <div
                key={s.status}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${orderColors[s.status] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}
              >
                <span className="text-xl">{statusIcons[s.status] || "•"}</span>
                <span className="text-lg font-black">{s.count}</span>
                <span className="text-[10px] font-semibold capitalize text-center leading-tight">
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Recent Orders + Low Stock ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <Card>
          <h2 className="text-sm font-bold text-white mb-4">Recent Orders</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <div className="text-3xl mb-2">📋</div>
              No orders yet
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <div
                  key={o._id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-xs font-bold text-indigo-400">
                      {statusIcons[o.orderStatus] || "📋"}
                    </div>
                    <div>
                      <p className="text-xs font-mono font-bold text-indigo-400">
                        #{o._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {o.shippingAddress.fullName} · {formatDate(o.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">${o.total.toFixed(2)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${orderColors[o.orderStatus]}`}>
                      {o.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <h2 className="text-sm font-bold text-white mb-1">Low Stock Alert</h2>
          <p className="text-xs text-slate-500 mb-4">Products with less than 10 units</p>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : lowStock.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm text-emerald-400 font-semibold">All products well stocked!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center text-lg">
                      {p.images?.[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                      ) : "📦"}
                    </div>
                    <p className="text-xs font-semibold text-white truncate max-w-40">{p.name}</p>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full ${p.stock === 0
                    ? "bg-rose-500/15 text-rose-400 border border-rose-500/25"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                    }`}>
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}

