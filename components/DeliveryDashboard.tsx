// // components/DeliveryBoy.tsx

// "use client";
// import Link from "next/link";

// const DELIVERIES = [
//   { id: "DEL-001", address: "12 Baker St, Dhaka", status: "Pending", time: "9:00 AM" },
//   { id: "DEL-002", address: "55 Gulshan Ave, Dhaka", status: "On the way", time: "10:30 AM" },
//   { id: "DEL-003", address: "77 Banani Rd, Dhaka", status: "Delivered", time: "8:15 AM" },
// ];

// const DeliveryDashboard = () => {
//   return (
//     <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
//       <div className="max-w-3xl mx-auto px-4 py-10">

//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-2xl font-bold text-slate-900">Delivery Dashboard</h1>
//           <p className="text-slate-400 text-sm mt-1">Your assigned deliveries for today</p>
//         </div>

//         {/* Stats row */}
//         <div className="grid grid-cols-3 gap-4 mb-8">
//           {[
//             { label: "Assigned", value: "3", color: "bg-blue-50 text-blue-700" },
//             { label: "Delivered", value: "1", color: "bg-green-50 text-green-700" },
//             { label: "Pending", value: "2", color: "bg-amber-50 text-amber-700" },
//           ].map((s) => (
//             <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center font-semibold`}>
//               <p className="text-2xl font-black">{s.value}</p>
//               <p className="text-xs mt-0.5 opacity-80">{s.label}</p>
//             </div>
//           ))}
//         </div>

//         {/* Delivery list */}
//         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
//           <div className="px-5 py-4 border-b border-slate-100">
//             <h2 className="text-sm font-bold text-slate-700">Today's Deliveries</h2>
//           </div>
//           <div className="divide-y divide-slate-50">
//             {DELIVERIES.map((d) => (
//               <div key={d.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
//                 <div className="flex items-start gap-3">
//                   <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-sm mt-0.5">
//                     📦
//                   </div>
//                   <div>
//                     <p className="text-sm font-semibold text-slate-800">{d.id}</p>
//                     <p className="text-xs text-slate-400">{d.address}</p>
//                     <p className="text-xs text-slate-400 mt-0.5">🕐 {d.time}</p>
//                   </div>
//                 </div>
//                 <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${d.status === "Delivered" ? "bg-green-50 text-green-600"
//                     : d.status === "On the way" ? "bg-blue-50 text-blue-600"
//                       : "bg-amber-50 text-amber-600"
//                   }`}>
//                   {d.status}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Action links */}
//         <div className="flex gap-3">
//           <Link href="/delivery" className="flex-1 text-center px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95">
//             All Deliveries
//           </Link>
//           <Link href="/delivery/history" className="flex-1 text-center px-4 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95">
//             Delivery History
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DeliveryDashboard;



// --------------------------------------------

// components/DeliveryDashboard.tsx
// Delivery boy's personal dashboard.
// Shows: greeting, KPI stat cards (earnings, deliveries, today, last week),
// order status breakdown, weekly bar chart (recharts), and live delivery list.
// Design: warm dark theme (slate-900 base + amber/orange accents).
// All data is mock — replace with real API calls as needed.

"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ─── Mock Data ────────────────────────────────────────────────
const WEEKLY_DATA = [
  { day: "Mon", deliveries: 8,  earned: 320 },
  { day: "Tue", deliveries: 12, earned: 480 },
  { day: "Wed", deliveries: 6,  earned: 240 },
  { day: "Thu", deliveries: 15, earned: 600 },
  { day: "Fri", deliveries: 10, earned: 400 },
  { day: "Sat", deliveries: 18, earned: 720 },
  { day: "Sun", deliveries: 4,  earned: 160 },
];

const TODAY_ORDERS = [
  { id: "ORD-7821", customer: "Rafi Hossain",   address: "12 Gulshan Ave, Dhaka",    time: "9:00 AM",  status: "delivered",  amount: "$14.00" },
  { id: "ORD-7822", customer: "Nadia Islam",    address: "55 Banani Rd, Dhaka",      time: "10:30 AM", status: "on-the-way", amount: "$9.50"  },
  { id: "ORD-7823", customer: "Karim Uddin",    address: "77 Mirpur-10, Dhaka",      time: "11:15 AM", status: "on-the-way", amount: "$21.00" },
  { id: "ORD-7824", customer: "Sumaiya Begum",  address: "3 Uttara Sec-7, Dhaka",   time: "12:00 PM", status: "pending",    amount: "$7.75"  },
  { id: "ORD-7825", customer: "Tanvir Ahmed",   address: "90 Dhanmondi 32, Dhaka",  time: "1:30 PM",  status: "pending",    amount: "$18.25" },
  { id: "ORD-7826", customer: "Meherun Nessa",  address: "14 Mohammadpur, Dhaka",   time: "2:45 PM",  status: "cancelled",  amount: "$5.00"  },
];

const STATUS_SUMMARY = [
  { label: "Delivered",   count: 1,  color: "#10b981", bg: "bg-emerald-500/10",  text: "text-emerald-400",  dot: "bg-emerald-400", icon: "✓" },
  { label: "On the Way",  count: 2,  color: "#f59e0b", bg: "bg-amber-500/10",    text: "text-amber-400",    dot: "bg-amber-400",   icon: "🛵" },
  { label: "Pending",     count: 2,  color: "#6366f1", bg: "bg-indigo-500/10",   text: "text-indigo-400",   dot: "bg-indigo-400",  icon: "⏳" },
  { label: "Cancelled",   count: 1,  color: "#f43f5e", bg: "bg-rose-500/10",     text: "text-rose-400",     dot: "bg-rose-400",    icon: "✕" },
];

const STAT_CARDS = [
  {
    label: "Total Earned",
    value: "$2,920",
    sub: "+$160 today",
    positive: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/20",
  },
  {
    label: "Total Deliveries",
    value: "73",
    sub: "All time",
    positive: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    accent: "from-sky-500 to-blue-600",
    glow: "shadow-sky-500/20",
  },
  {
    label: "Today's Deliveries",
    value: "6",
    sub: "1 done · 2 on way",
    positive: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    accent: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/20",
  },
  {
    label: "Last Week",
    value: "73",
    sub: "+12% vs prev week",
    positive: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    accent: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
  },
];

// ─── Status badge helper ───────────────────────────────────────
const statusConfig: Record<string, { label: string; classes: string; dot: string }> = {
  delivered:   { label: "Delivered",   classes: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20", dot: "bg-emerald-400" },
  "on-the-way":{ label: "On the Way",  classes: "bg-amber-500/15 text-amber-400 border border-amber-500/20",     dot: "bg-amber-400 animate-pulse" },
  pending:     { label: "Pending",     classes: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",  dot: "bg-indigo-400" },
  cancelled:   { label: "Cancelled",  classes: "bg-rose-500/15 text-rose-400 border border-rose-500/20",        dot: "bg-rose-400" },
};

// ─── Custom Tooltip for chart ─────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl text-xs">
        <p className="text-slate-300 font-semibold mb-1">{label}</p>
        <p className="text-amber-400 font-bold">{payload[0].value} deliveries</p>
        <p className="text-slate-400">${payload[0].value * 40} earned</p>
      </div>
    );
  }
  return null;
};

// ─── Main component ───────────────────────────────────────────
const DeliveryDashboard = () => {
  const [chartMetric, setChartMetric] = useState<"deliveries" | "earned">("deliveries");
  const todayTotal = TODAY_ORDERS.length;
  const todayDone  = TODAY_ORDERS.filter((o) => o.status === "delivered").length;

  return (
    <div
      className="min-h-screen bg-[#0d1117] text-white"
      style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
    >
      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-125 h-125 rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-100 h-100 rounded-full bg-sky-500/5 blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Greeting banner ── */}
        <div
          className="relative overflow-hidden rounded-3xl p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{
            background: "linear-gradient(135deg, #1a2535 0%, #111827 60%, #1c1a30 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Decorative stripe */}
          <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-3xl bg-linear-to-b from-amber-400 to-orange-500" />
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-amber-500/8 blur-2xl" />

          <div className="pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🛵</span>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                On Duty
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Good morning, Rafiq! 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1.5">
              You have <span className="text-amber-400 font-semibold">{todayTotal - todayDone} deliveries</span> remaining today. Keep it up!
            </p>
          </div>

          {/* Progress ring */}
          <div className="pl-4 sm:pl-0 flex items-center gap-5 shrink-0">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="32" fill="none"
                  stroke="url(#grad)" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - todayDone / todayTotal)}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-white leading-none">{todayDone}</span>
                <span className="text-[10px] text-slate-400">of {todayTotal}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Today's Progress</p>
              <p className="text-sm font-bold text-white">{Math.round((todayDone / todayTotal) * 100)}% done</p>
              <p className="text-xs text-amber-400 mt-0.5">🔥 Great pace!</p>
            </div>
          </div>
        </div>

        {/* ── KPI Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((card, i) => (
            <div
              key={card.label}
              className={`relative overflow-hidden rounded-2xl p-5 shadow-xl ${card.glow} group cursor-default`}
              style={{
                background: "linear-gradient(145deg, #161d2b 0%, #111520 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
                animationDelay: `${i * 80}ms`,
              }}
            >
              {/* Icon */}
              <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${card.accent} flex items-center justify-center text-white shadow-lg mb-4`}>
                {card.icon}
              </div>

              {/* Value */}
              <p className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                {card.value}
              </p>
              <p className="text-xs text-slate-500 font-medium">{card.label}</p>

              {/* Sub */}
              <p className="text-[11px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                <span>↑</span>{card.sub}
              </p>

              {/* Corner glow */}
              <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-linear-to-br ${card.accent} opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300`} />
            </div>
          ))}
        </div>

        {/* ── Chart + Status summary row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Bar Chart — spans 2 cols */}
          <div
            className="lg:col-span-2 rounded-2xl p-6"
            style={{
              background: "linear-gradient(145deg, #161d2b 0%, #111520 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-white">Weekly Performance</h2>
                <p className="text-xs text-slate-500 mt-0.5">Last 7 days breakdown</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-800/80 rounded-xl p-1 border border-slate-700/50">
                {(["deliveries", "earned"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setChartMetric(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      chartMetric === m
                        ? "bg-amber-500 text-slate-900 shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {m === "deliveries" ? "Orders" : "Earned"}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={WEEKLY_DATA} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)", radius: 8 }} />
                <Bar dataKey={chartMetric} radius={[6, 6, 0, 0]}>
                  {WEEKLY_DATA.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={index === 5 ? "#f59e0b" : "rgba(245,158,11,0.35)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Chart legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/50">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-3 h-3 rounded bg-amber-500" />
                Best day (Sat)
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-3 h-3 rounded bg-amber-500/35" />
                Other days
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div
            className="rounded-2xl p-6 flex flex-col justify-between"
            style={{
              background: "linear-gradient(145deg, #161d2b 0%, #111520 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div>
              <h2 className="text-base font-bold text-white mb-1">Order Status</h2>
              <p className="text-xs text-slate-500 mb-5">Today's breakdown</p>

              <div className="space-y-3">
                {STATUS_SUMMARY.map((s) => (
                  <div key={s.label} className={`flex items-center justify-between px-4 py-3 rounded-xl ${s.bg}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className={`text-sm font-semibold ${s.text}`}>{s.label}</span>
                    </div>
                    <span className={`text-lg font-black ${s.text}`}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Donut-style total */}
            <div className="mt-5 pt-5 border-t border-white/40 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Completion rate</p>
                <p className="text-xl font-black text-white mt-0.5">16.7%</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" style={{ animationDuration: "3s" }} />
            </div>
          </div>
        </div>

        {/* ── Today's Delivery List ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #161d2b 0%, #111520 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Table header */}
          <div className="px-6 py-4 border-b border-white/40 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Today's Deliveries</h2>
              <p className="text-xs text-slate-500 mt-0.5">{todayTotal} orders assigned</p>
            </div>
            <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full font-semibold">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </span>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/40">
                  {["Order ID", "Customer", "Address", "Time", "Amount", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TODAY_ORDERS.map((order, i) => {
                  const cfg = statusConfig[order.status];
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-white/30 hover:bg-white/20 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-amber-400 font-bold">{order.id}</td>
                      <td className="px-6 py-4 text-white font-medium">{order.customer}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs max-w-40 truncate">{order.address}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{order.time}</td>
                      <td className="px-6 py-4 text-white font-bold">{order.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-white/40">
            {TODAY_ORDERS.map((order) => {
              const cfg = statusConfig[order.status];
              return (
                <div key={order.id} className="px-5 py-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-amber-400 font-bold">{order.id}</span>
                      <span className="text-xs text-slate-500">{order.time}</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{order.customer}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{order.address}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-sm font-bold text-white">{order.amount}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.classes}`}>
                      <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom: Performance tips + quick actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">

          {/* Performance card */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "linear-gradient(135deg, #1a2535 0%, #111827 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">⚡</span>
              <h3 className="text-sm font-bold text-white">Performance</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "On-time rate",   value: 94, color: "bg-emerald-500" },
                { label: "Customer rating", value: 87, color: "bg-amber-500"  },
                { label: "Acceptance rate", value: 78, color: "bg-sky-500"    },
              ].map((p) => (
                <div key={p.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">{p.label}</span>
                    <span className="text-white font-bold">{p.value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${p.color} rounded-full transition-all duration-700`}
                      style={{ width: `${p.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "linear-gradient(135deg, #1a2535 0%, #111827 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🚀</span>
              <h3 className="text-sm font-bold text-white">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "All Deliveries",   href: "/delivery",         color: "bg-amber-500 hover:bg-amber-400 text-slate-900",            },
                { label: "History",          href: "/delivery/history", color: "bg-white/[0.07] hover:bg-white/[0.1] text-white border border-white/[0.07]", },
                { label: "My Earnings",      href: "/delivery/earnings",color: "bg-white/[0.07] hover:bg-white/[0.1] text-white border border-white/[0.07]", },
                { label: "Support",          href: "/support",          color: "bg-white/[0.07] hover:bg-white/[0.1] text-white border border-white/[0.07]", },
              ].map((a) => (
                <a
                  key={a.label}
                  href={a.href}
                  className={`flex items-center justify-center text-center px-3 py-3 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${a.color}`}
                >
                  {a.label}
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DeliveryDashboard;