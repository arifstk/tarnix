// components/admin/OrdersSection.tsx
// CHANGELOG: Full orders management — fetch from MongoDB, update status, view detail modal

"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────
type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed";
type PaymentMethod = "cod" | "stripe";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  stripePaymentIntentId?: string;
  subtotal: number;
  total: number;
  createdAt: string;
}

// ─── Style maps ───────────────────────────────────────────────
const orderColors: Record<OrderStatus, string> = {
  pending: "bg-slate-500/15   text-slate-300   border border-slate-500/25",
  confirmed: "bg-indigo-500/15  text-indigo-300  border border-indigo-500/25",
  processing: "bg-amber-500/15   text-amber-300   border border-amber-500/25",
  shipped: "bg-sky-500/15     text-sky-300     border border-sky-500/25",
  delivered: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
  cancelled: "bg-rose-500/15    text-rose-300    border border-rose-500/25",
};

const paymentColors: Record<PaymentStatus, string> = {
  pending: "bg-amber-500/15  text-amber-300  border border-amber-500/25",
  paid: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
  failed: "bg-rose-500/15   text-rose-300   border border-rose-500/25",
};

// ─── Reusable UI ──────────────────────────────────────────────
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-5 ${className}`}
    style={{ background: "linear-gradient(145deg,#141b2d,#0f1420)", border: "1px solid rgba(255,255,255,0.06)" }}>
    {children}
  </div>
);

const Btn = ({ children, variant = "primary", size = "sm", onClick, disabled, className = "" }:
  { children: React.ReactNode; variant?: "primary" | "ghost" | "danger"; size?: "sm" | "xs"; onClick?: () => void; disabled?: boolean; className?: string }) => {
  const v = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30",
    ghost: "bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08]",
    danger: "bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/25",
  }[variant];
  const s = size === "xs" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm";
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${v} ${s} rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}>
      {children}
    </button>
  );
};

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
    <div className="w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      style={{ background: "#141b2d", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <button onClick={onClose}
          className="w-7 h-7 rounded-lg bg-white/[0.07] hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">✕</button>
      </div>
      {children}
    </div>
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b animate-pulse" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3 bg-slate-700/60 rounded-full w-full" />
      </td>
    ))}
  </tr>
);

// ─── ORDER STATUS OPTIONS ──────────────────────────────────────
const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed"];

// ═══════════════════════════════════════════════════════════════
export default function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null); // orderId being updated

  // ── Fetch orders ──
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Update order or payment status ──
  const updateOrder = async (
    orderId: string,
    field: "orderStatus" | "paymentStatus",
    value: string
  ) => {
    setUpdating(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, [field]: value }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local state instantly — no full refetch needed
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, [field]: value } : o))
        );
        // Also update modal if open
        if (viewOrder?._id === orderId) {
          setViewOrder((prev) => prev ? { ...prev, [field]: value } : prev);
        }
      }
    } catch (err) {
      console.error("Failed to update order:", err);
    } finally {
      setUpdating(null);
    }
  };

  // ── Filter ──
  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress.fullName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Format date ──
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="max-w-7xl space-y-4">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Manage Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">{orders.length} total orders</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID or customer…"
            className="px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64"
          />
          <Btn variant="ghost" size="sm" onClick={fetchOrders}>↻ Refresh</Btn>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${statusFilter === "all"
            ? "bg-indigo-600 text-white border-indigo-500"
            : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20"
            }`}
        >
          All ({orders.length})
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${statusFilter === s
              ? orderColors[s] + " ring-2 ring-white/20"
              : orderColors[s] + " opacity-60 hover:opacity-100"
              }`}
          >
            {s} ({orders.filter((o) => o.orderStatus === s).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wider border-b"
                style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                {["Order ID", "Customer", "Items", "Total", "Payment", "Order Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center text-slate-500 text-sm">
                        <div className="text-4xl mb-3">📋</div>
                        No orders found
                      </td>
                    </tr>
                  )
                  : filtered.map((o) => (
                    <tr key={o._id} className="border-b hover:bg-white/3 transition-colors"
                      style={{ borderColor: "rgba(255,255,255,0.03)" }}>

                      {/* Order ID */}
                      <td className="px-5 py-3.5 font-mono text-xs text-indigo-400 font-bold">
                        #{o._id.slice(-6).toUpperCase()}
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-3.5">
                        <p className="text-white font-medium text-xs">{o.shippingAddress.fullName}</p>
                        <p className="text-slate-500 text-xs">{o.shippingAddress.city}</p>
                      </td>

                      {/* Items */}
                      <td className="px-5 py-3.5 text-slate-400 text-xs">
                        {o.items.reduce((s, i) => s + i.quantity, 0)} items
                      </td>

                      {/* Total */}
                      <td className="px-5 py-3.5 text-white font-bold text-xs">
                        ${o.total.toFixed(2)}
                      </td>

                      {/* Payment status — inline dropdown */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${paymentColors[o.paymentStatus]}`}>
                            {o.paymentMethod === "cod" ? "💵" : "💳"} {o.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* Order status — inline dropdown */}
                      <td className="px-5 py-3.5">
                        <select
                          value={o.orderStatus}
                          disabled={updating === o._id}
                          onChange={(e) => updateOrder(o._id, "orderStatus", e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-all ${orderColors[o.orderStatus]} bg-transparent disabled:opacity-50`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-slate-800 text-white">{s}</option>
                          ))}
                        </select>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                        {formatDate(o.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <Btn variant="ghost" size="xs" onClick={() => setViewOrder(o)}>
                          View
                        </Btn>
                      </td>

                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Order Detail Modal ── */}
      {viewOrder && (
        <Modal title={`Order #${viewOrder._id.slice(-6).toUpperCase()}`} onClose={() => setViewOrder(null)}>
          <div className="space-y-5">

            {/* Status controls */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Order Status</label>
                <select
                  value={viewOrder.orderStatus}
                  disabled={updating === viewOrder._id}
                  onChange={(e) => updateOrder(viewOrder._id, "orderStatus", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:opacity-50"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Payment Status</label>
                {viewOrder.orderStatus === "delivered" ? (
                  // ← Read-only when delivered — auto-set by delivery boy
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400">Paid</span>
                    <span className="text-xs text-emerald-400/60 ml-auto">Auto-confirmed on delivery</span>
                  </div>
                ) : (
                  <select
                    value={viewOrder.paymentStatus}
                    disabled={updating === viewOrder._id}
                    onChange={(e) => updateOrder(viewOrder._id, "paymentStatus", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:opacity-50"
                  >
                    {PAYMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${orderColors[viewOrder.orderStatus]}`}>
                {viewOrder.orderStatus}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${paymentColors[viewOrder.paymentStatus]}`}>
                {viewOrder.paymentMethod === "cod" ? "💵 COD" : "💳 Stripe"} · {viewOrder.paymentStatus}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/30">
                {formatDate(viewOrder.createdAt)}
              </span>
            </div>

            {/* Shipping address */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">📍 Shipping Address</p>
              <p className="text-sm font-semibold text-white">{viewOrder.shippingAddress.fullName}</p>
              <p className="text-xs text-slate-400 mt-0.5">{viewOrder.shippingAddress.phone}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {viewOrder.shippingAddress.address}, {viewOrder.shippingAddress.city}, {viewOrder.shippingAddress.postalCode}
              </p>
              <p className="text-xs text-slate-400">{viewOrder.shippingAddress.country}</p>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">🛍 Items</p>
              <div className="space-y-2">
                {viewOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-700 shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-slate-700/50 pt-4 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal</span>
                <span>${viewOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Shipping</span>
                {(() => {
                  const shipping = viewOrder.total - viewOrder.subtotal;
                  return shipping > 0
                    ? <span className="text-white">${shipping.toFixed(2)}</span>
                    : <span className="text-emerald-400">Free</span>;
                })()}
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1">
                <span>Total</span>
                <span>${viewOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Stripe ID if available */}
            {viewOrder.stripePaymentIntentId && (
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                <p className="text-xs text-slate-500">Stripe Payment Intent</p>
                <p className="text-xs font-mono text-indigo-400 mt-0.5 break-all">{viewOrder.stripePaymentIntentId}</p>
              </div>
            )}

            <Btn variant="ghost" className="w-full" onClick={() => setViewOrder(null)}>Close</Btn>
          </div>
        </Modal>
      )}

    </div>
  );
}

