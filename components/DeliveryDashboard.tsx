// components/DeliveryDashboard.tsx

"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────
interface AvailableOrder {
  _id: string;
  shippingAddress: { fullName: string; address: string; city: string; phone: string };
  items: { name: string; quantity: number; price: number }[];
  total: number;
  paymentMethod: string;
  createdAt: string;
}

interface MyAssignment {
  _id: string;
  orderId: string;
  status: "accepted" | "picked-up" | "on-the-way" | "delivered";
  acceptedAt: string;
  deliveredAt?: string;
  deliveryFee: number;
  order: {
    _id: string;
    shippingAddress: { fullName: string; address: string; city: string; phone: string };
    items: { name: string; quantity: number; price: number }[];
    total: number;
    paymentMethod: string;
  };
}

type DeliveryStatus = "accepted" | "picked-up" | "on-the-way" | "delivered";

// ─── Constants ────────────────────────────────────────────────
const DELIVERY_STEPS: DeliveryStatus[] = ["accepted", "picked-up", "on-the-way", "delivered"];

const STEP_META: Record<DeliveryStatus, { label: string; icon: string; color: string; bg: string; border: string }> = {
  "accepted": { label: "Accepted", icon: "✓", color: "text-indigo-400", bg: "bg-indigo-500", border: "border-indigo-400" },
  "picked-up": { label: "Picked Up", icon: "📦", color: "text-amber-400", bg: "bg-amber-500", border: "border-amber-400" },
  "on-the-way": { label: "On the Way", icon: "🛵", color: "text-sky-400", bg: "bg-sky-500", border: "border-sky-400" },
  "delivered": { label: "Delivered", icon: "✅", color: "text-emerald-400", bg: "bg-emerald-500", border: "border-emerald-400" },
};

const STATUS_BADGE: Record<DeliveryStatus, string> = {
  "accepted": "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25",
  "picked-up": "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  "on-the-way": "bg-sky-500/15 text-sky-400 border border-sky-500/25",
  "delivered": "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
};

const NEXT_STATUS: Partial<Record<DeliveryStatus, DeliveryStatus>> = {
  "accepted": "picked-up",
  "picked-up": "on-the-way",
  "on-the-way": "delivered",
};

const NEXT_LABEL: Partial<Record<DeliveryStatus, string>> = {
  "accepted": "Mark Picked Up",
  "picked-up": "Mark On the Way",
  "on-the-way": "✓ Confirm Delivery & Payment",
};

// ─── Custom Tooltip ───────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl text-xs">
      <p className="text-slate-300 font-semibold mb-1">{label}</p>
      <p className="text-amber-400 font-bold">{payload[0].value} deliveries</p>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

// ═══════════════════════════════════════════════════════════════
export default function DeliveryDashboard() {
  const { data: session } = useSession();

  // ── Data state ──
  const [availableOrders, setAvailableOrders] = useState<AvailableOrder[]>([]);
  const [myAssignments, setMyAssignments] = useState<MyAssignment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // ── UI state ──
  const [activeTab, setActiveTab] = useState<"available" | "my-orders">("available");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<"deliveries" | "earned">("deliveries");

  // ── Derived stats from real data ──
  const totalDeliveries = myAssignments.length;
  const doneToday = myAssignments.filter((a) => a.status === "delivered").length;
  const inProgress = myAssignments.filter((a) => a.status !== "delivered").length;
  const totalEarned = myAssignments
    .filter((a) => a.status === "delivered")
    .reduce((sum, a) => sum + (a.deliveryFee || 0), 0);

  // ── Weekly chart — built from real assignments ──
  const weeklyData = (() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = Array(7).fill(0);
    myAssignments.forEach((a) => {
      const d = new Date(a.acceptedAt).getDay();
      counts[d]++;
    });
    return days.map((day, i) => ({ day, deliveries: counts[i] }));
  })();

  // ── Fetch ──
  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [avail, mine] = await Promise.all([
        fetch("/api/delivery/available-orders").then((r) => r.json()),
        fetch("/api/delivery/my-orders").then((r) => r.json()),
      ]);
      if (avail.success) setAvailableOrders(avail.orders);
      if (mine.success) setMyAssignments(mine.assignments);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Accept order ──
  const handleAccept = async (orderId: string) => {
    setAcceptingId(orderId);
    try {
      const res = await fetch("/api/delivery/accept-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
        setActiveTab("my-orders");
      } else {
        alert(data.error || "Failed to accept order.");
      }
    } finally {
      setAcceptingId(null);
    }
  };

  // ── Update delivery status ──
  const handleUpdateStatus = async (orderId: string, status: DeliveryStatus) => {
    if (status === "delivered") {
      const ok = window.confirm(
        "Confirm delivery?\n\nThis will:\n• Mark order as Delivered\n• Mark payment as Paid\n• Notify the admin"
      );
      if (!ok) return;
    }
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/delivery/update-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      } else {
        alert(data.error || "Failed to update.");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const deliveryBoyName = session?.user?.name || "Delivery Boy";
  const firstName = deliveryBoyName.split(" ")[0];
  const progressPct = totalDeliveries > 0 ? Math.round((doneToday / totalDeliveries) * 100) : 0;

  // ── Status breakdown ──
  const statusBreakdown = DELIVERY_STEPS.map((s) => ({
    ...STEP_META[s],
    key: s,
    count: myAssignments.filter((a) => a.status === s).length,
  }));

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  // ─────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-[#0d1117] text-white"
      style={{ fontFamily: "'Plus Jakarta Sans','DM Sans',sans-serif" }}
    >
      {/* ── Ambient bg ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-20 w-125 h-125 rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-100 h-100 rounded-full bg-sky-500/5 blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ════ GREETING BANNER ════ */}
        <div
          className="relative overflow-hidden rounded-3xl p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          style={{
            background: "linear-gradient(135deg,#1a2535 0%,#111827 60%,#1c1a30 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-3xl bg-linear-to-b from-amber-400 to-orange-500" />
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-amber-500/8 blur-3xl" />

          <div className="pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🛵</span>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                On Duty
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Good day, {firstName}! 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1.5">
              {inProgress > 0
                ? <>You have <span className="text-amber-400 font-semibold">{inProgress} active</span> {inProgress === 1 ? "delivery" : "deliveries"} in progress.</>
                : availableOrders.length > 0
                  ? <><span className="text-amber-400 font-semibold">{availableOrders.length} orders</span> are waiting to be picked up.</>
                  : "No active deliveries — check available orders!"}
            </p>

            {/* Delivery boy info */}
            <div className="flex items-center gap-2 mt-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-black text-white">
                {firstName[0]}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{deliveryBoyName}</p>
                <p className="text-[10px] text-slate-500">{session?.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Progress ring */}
          <div className="pl-4 sm:pl-0 flex items-center gap-5 shrink-0">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                <circle
                  cx="40" cy="40" r="32" fill="none"
                  stroke="url(#grad)" strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - progressPct / 100)}`}
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-white leading-none">{doneToday}</span>
                <span className="text-[10px] text-slate-400">of {totalDeliveries}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Completion</p>
              <p className="text-lg font-black text-white">{progressPct}%</p>
              <p className="text-xs text-amber-400 mt-0.5">
                {progressPct === 100 ? "🎉 All done!" : progressPct > 50 ? "🔥 Great pace!" : "💪 Keep going!"}
              </p>
            </div>
          </div>
        </div>

        {/* ════ STAT CARDS ════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Earned",
              value: `$${totalEarned.toFixed(2)}`,
              sub: `From ${doneToday} delivered order${doneToday !== 1 ? "s" : ""}`,
              icon: "💰",
              accent: "from-amber-500 to-orange-500",
              glow: "shadow-amber-500/20",
            },
            {
              label: "Total Accepted",
              value: String(totalDeliveries),
              sub: "All time",
              icon: "📋",
              accent: "from-indigo-500 to-violet-600",
              glow: "shadow-indigo-500/20",
            },
            {
              label: "Delivered",
              value: String(doneToday),
              sub: `${inProgress} in progress`,
              icon: "✅",
              accent: "from-emerald-500 to-teal-500",
              glow: "shadow-emerald-500/20",
            },
            {
              label: "Available Now",
              value: String(availableOrders.length),
              sub: "Ready to accept",
              icon: "🚦",
              accent: "from-sky-500 to-blue-600",
              glow: "shadow-sky-500/20",
            },
          ].map((card) => (
            <div
              key={card.label}
              className={`relative overflow-hidden rounded-2xl p-5 shadow-xl ${card.glow} group`}
              style={{
                background: "linear-gradient(145deg,#161d2b,#111520)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${card.accent} flex items-center justify-center text-lg mb-4 shadow-lg`}>
                {card.icon}
              </div>
              {loadingData ? (
                <>
                  <Skeleton className="h-7 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </>
              ) : (
                <>
                  <p className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">{card.label}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-2">↑ {card.sub}</p>
                </>
              )}
              <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-linear-to-br ${card.accent} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`} />
            </div>
          ))}
        </div>

        {/* ════ CHART + STATUS BREAKDOWN ════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Bar Chart */}
          <div
            className="lg:col-span-2 rounded-2xl p-6"
            style={{
              background: "linear-gradient(145deg,#161d2b,#111520)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-bold text-white">Weekly Activity</h2>
                <p className="text-xs text-slate-500 mt-0.5">Your deliveries this week</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-800/80 rounded-xl p-1 border border-slate-700/50">
                {(["deliveries", "earned"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setChartMetric(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${chartMetric === m
                      ? "bg-amber-500 text-slate-900 shadow"
                      : "text-slate-400 hover:text-white"
                      }`}
                  >
                    {m === "deliveries" ? "Orders" : "Earned"}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="deliveries" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.deliveries === Math.max(...weeklyData.map((d) => d.deliveries))
                          ? "#f59e0b"
                          : "rgba(245,158,11,0.3)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-3 h-3 rounded bg-amber-500" /> Best day
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-3 h-3 rounded bg-amber-500/30" /> Other days
              </div>
            </div>
          </div>

          {/* Status breakdown */}
          <div
            className="rounded-2xl p-6 flex flex-col justify-between"
            style={{
              background: "linear-gradient(145deg,#161d2b,#111520)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div>
              <h2 className="text-sm font-bold text-white mb-1">Delivery Status</h2>
              <p className="text-xs text-slate-500 mb-5">All-time breakdown</p>

              <div className="space-y-3">
                {statusBreakdown.map((s) => (
                  <div
                    key={s.key}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/3 border border-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{s.icon}</span>
                      <span className={`text-sm font-semibold ${s.color}`}>{s.label}</span>
                    </div>
                    {loadingData ? (
                      <Skeleton className="h-5 w-6" />
                    ) : (
                      <span className={`text-lg font-black ${s.color}`}>{s.count}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/5">
              <p className="text-xs text-slate-500 mb-1">Success rate</p>
              <p className="text-2xl font-black text-white">
                {totalDeliveries > 0
                  ? `${Math.round((doneToday / totalDeliveries) * 100)}%`
                  : "—"}
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-amber-500 to-orange-500 transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ════ ORDERS TABS ════ */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg,#161d2b,#111520)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Tab bar */}
          <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-1 bg-slate-800/80 rounded-xl p-1 border border-slate-700/50">
              {(["available", "my-orders"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab
                    ? "bg-amber-500 text-slate-900 shadow"
                    : "text-slate-400 hover:text-white"
                    }`}
                >
                  {tab === "available"
                    ? `🚦 Available (${availableOrders.length})`
                    : `📦 My Orders (${myAssignments.length})`}
                </button>
              ))}
            </div>
            <button
              onClick={fetchData}
              className="text-xs text-slate-400 hover:text-white bg-white/4 hover:bg-white/8 px-3 py-2 rounded-xl border border-white/6 transition-all flex items-center gap-1.5"
            >
              <span className={loadingData ? "animate-spin inline-block" : ""}>↻</span>
              Refresh
            </button>
          </div>

          {/* ── Available Orders ── */}
          {activeTab === "available" && (
            <div className="p-6">
              {loadingData ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              ) : availableOrders.length === 0 ? (
                <div className="text-center py-14">
                  <div className="text-5xl mb-3">🎉</div>
                  <p className="text-slate-300 text-sm font-bold">No orders available right now</p>
                  <p className="text-slate-600 text-xs mt-1">
                    Orders appear here when admin marks them as shipped.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/3 border border-white/6 hover:border-amber-500/30 transition-all"
                    >
                      <div className="flex-1 min-w-0 space-y-1.5">
                        {/* ID + payment badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-amber-400">
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${order.paymentMethod === "cod"
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
                            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                            }`}>
                            {order.paymentMethod === "cod" ? "💵 Collect Cash" : "💳 Already Paid"}
                          </span>
                        </div>

                        {/* Customer */}
                        <p className="text-sm font-bold text-white">
                          {order.shippingAddress.fullName}
                        </p>

                        {/* Address */}
                        <p className="text-xs text-slate-400 truncate">
                          📍 {order.shippingAddress.address}, {order.shippingAddress.city}
                        </p>

                        {/* Phone */}
                        <p className="text-xs text-slate-500">
                          📞 {order.shippingAddress.phone}
                        </p>

                        {/* Items + total */}
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>🛍 {order.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                          <span className="text-white font-black text-sm">
                            ${order.total.toFixed(2)}
                          </span>
                          <span className="text-slate-600">{formatDate(order.createdAt)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAccept(order._id)}
                        disabled={acceptingId === order._id}
                        className="shrink-0 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-900/20"
                      >
                        {acceptingId === order._id ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Accepting…
                          </span>
                        ) : (
                          "Accept Delivery 🛵"
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── My Orders ── */}
          {activeTab === "my-orders" && (
            <div className="p-6">
              {loadingData ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
                </div>
              ) : myAssignments.length === 0 ? (
                <div className="text-center py-14">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-slate-300 text-sm font-bold">No orders accepted yet</p>
                  <p className="text-slate-600 text-xs mt-1">
                    Go to Available tab to pick up your first delivery.
                  </p>
                  <button
                    onClick={() => setActiveTab("available")}
                    className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-black transition-all"
                  >
                    View Available Orders
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myAssignments.map((a) => {
                    const currentIdx = DELIVERY_STEPS.indexOf(a.status);
                    const next = NEXT_STATUS[a.status];
                    const isExpanded = expandedId === a._id;
                    const isDelivered = a.status === "delivered";

                    return (
                      <div
                        key={a._id}
                        className={`rounded-2xl border transition-all ${isDelivered
                          ? "border-emerald-500/20 bg-emerald-500/3"
                          : "border-white/6 bg-white/3"
                          }`}
                      >
                        {/* Card header — always visible */}
                        <div
                          className="flex items-center justify-between gap-3 p-4 cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : a._id)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Status icon */}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${isDelivered ? "bg-emerald-500/20" : "bg-amber-500/15"
                              }`}>
                              {STEP_META[a.status].icon}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-amber-400">
                                  #{a.order?._id?.slice(-6).toUpperCase()}
                                </span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[a.status]}`}>
                                  {STEP_META[a.status].label}
                                </span>
                              </div>
                              <p className="text-sm font-bold text-white truncate">
                                {a.order?.shippingAddress?.fullName}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                📍 {a.order?.shippingAddress?.city}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-black text-white">
                              ${a.order?.total?.toFixed(2)}
                            </span>
                            <span className={`text-slate-500 text-xs transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                              ▼
                            </span>
                          </div>
                        </div>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">

                            {/* Progress steps */}
                            <div>
                              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">
                                Delivery Progress
                              </p>
                              <div className="flex items-center">
                                {DELIVERY_STEPS.map((step, idx) => {
                                  const done = idx < currentIdx;
                                  const current = idx === currentIdx;
                                  const meta = STEP_META[step];
                                  return (
                                    <div key={step} className="flex items-center flex-1">
                                      <div className="flex flex-col items-center gap-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? "bg-amber-500 border-amber-500 text-slate-900" :
                                          current ? `${meta.bg} ${meta.border} text-white ring-4 ring-white/10` :
                                            "bg-slate-800 border-slate-700 text-slate-600"
                                          }`}>
                                          {done ? "✓" : meta.icon}
                                        </div>
                                        <span className={`text-[9px] font-semibold whitespace-nowrap ${current ? meta.color : done ? "text-amber-400" : "text-slate-600"
                                          }`}>
                                          {meta.label}
                                        </span>
                                      </div>
                                      {idx < DELIVERY_STEPS.length - 1 && (
                                        <div className={`flex-1 h-0.5 mb-4 mx-1 ${idx < currentIdx ? "bg-amber-500" : "bg-slate-700"
                                          }`} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Customer info */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Customer</p>
                                <p className="text-xs font-bold text-white">{a.order?.shippingAddress?.fullName}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{a.order?.shippingAddress?.phone}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Address</p>
                                <p className="text-xs font-bold text-white">{a.order?.shippingAddress?.city}</p>
                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{a.order?.shippingAddress?.address}</p>
                              </div>
                            </div>

                            {/* Items list */}
                            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Items</p>
                              <div className="space-y-1.5">
                                {a.order?.items?.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between">
                                    <span className="text-xs text-slate-300 truncate">{item.name}</span>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-xs text-slate-500">×{item.quantity}</span>
                                      <span className="text-xs font-bold text-white">
                                        ${(item.price * item.quantity).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {/* total */}
                              <div className="flex justify-between pt-2 mt-2 border-t border-slate-700/50">
                                <span className="text-xs font-bold text-slate-400">Total</span>
                                <span className="text-sm font-black text-white">${a.order?.total?.toFixed(2)}</span>
                              </div>
                              {/* delivery fee  */}
                              <div className="flex justify-between pt-2 mt-2 border-t border-slate-700/50">
                                <span className="text-xs font-bold text-amber-400">Your Delivery Fee</span>
                                <span className="text-sm font-black text-amber-400">
                                  ${(a.deliveryFee || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Payment method */}
                            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${a.order?.paymentMethod === "cod"
                              ? "bg-amber-500/10 border-amber-500/20"
                              : "bg-emerald-500/10 border-emerald-500/20"
                              }`}>
                              <span>{a.order?.paymentMethod === "cod" ? "💵" : "💳"}</span>
                              <div>
                                <p className={`text-xs font-bold ${a.order?.paymentMethod === "cod" ? "text-amber-400" : "text-emerald-400"
                                  }`}>
                                  {a.order?.paymentMethod === "cod"
                                    ? isDelivered ? "Cash Collected ✓" : "Collect cash on delivery"
                                    : "Already paid online"}
                                </p>
                                {a.order?.paymentMethod === "cod" && !isDelivered && (
                                  <p className="text-[10px] text-amber-400/60">
                                    Amount: ${a.order?.total?.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Timestamps */}
                            <div className="flex gap-3 text-xs text-slate-600">
                              <span>Accepted: {formatTime(a.acceptedAt)}</span>
                              {a.deliveredAt && (
                                <span className="text-emerald-600">
                                  · Delivered: {formatTime(a.deliveredAt)}
                                </span>
                              )}
                            </div>

                            {/* Action button */}
                            <div className="flex justify-end">
                              {next && !isDelivered ? (
                                <button
                                  onClick={() => handleUpdateStatus(a.orderId, next)}
                                  disabled={updatingId === a.orderId}
                                  className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${next === "delivered"
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-900/20"
                                    : "bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-900/20"
                                    }`}
                                >
                                  {updatingId === a.orderId ? (
                                    <>
                                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                      </svg>
                                      Updating…
                                    </>
                                  ) : (
                                    NEXT_LABEL[a.status]
                                  )}
                                </button>
                              ) : isDelivered ? (
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                  <span className="text-emerald-400">✓</span>
                                  <div>
                                    <p className="text-xs font-bold text-emerald-400">Delivered & Paid</p>
                                    {a.deliveredAt && (
                                      <p className="text-[10px] text-emerald-400/60">
                                        {formatTime(a.deliveredAt)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ) : null}
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}