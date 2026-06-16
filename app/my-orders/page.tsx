// app/my-orders/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────
type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Review {
  productId: string;
  rating: number;
  comment: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: "cod" | "stripe";
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  total: number;
  reviews: Review[];
  createdAt: string;
}

// ─── Status config ────────────────────────────────────────────
const STATUS_STEPS: OrderStatus[] = [
  "pending", "confirmed", "processing", "shipped", "delivered",
];

const STATUS_META: Record<OrderStatus, { label: string; icon: string; color: string; bg: string; border: string }> = {
  pending: { label: "Pending", icon: "🕐", color: "text-slate-400", bg: "bg-slate-400", border: "border-slate-400" },
  confirmed: { label: "Confirmed", icon: "✅", color: "text-indigo-400", bg: "bg-indigo-500", border: "border-indigo-400" },
  processing: { label: "Processing", icon: "⚙️", color: "text-amber-400", bg: "bg-amber-500", border: "border-amber-400" },
  shipped: { label: "Shipped", icon: "🚚", color: "text-sky-400", bg: "bg-sky-500", border: "border-sky-400" },
  delivered: { label: "Delivered", icon: "🎉", color: "text-emerald-400", bg: "bg-emerald-500", border: "border-emerald-400" },
  cancelled: { label: "Cancelled", icon: "✕", color: "text-rose-400", bg: "bg-rose-500", border: "border-rose-400" },
};

const PAYMENT_META: Record<PaymentStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-amber-400" },
  paid: { label: "Paid", color: "text-emerald-400" },
  failed: { label: "Failed", color: "text-rose-400" },
};

// ─── Star Rating Input ────────────────────────────────────────
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl transition-transform hover:scale-110 active:scale-95"
        >
          <span className={(hover || value) >= star ? "text-amber-400" : "text-slate-600"}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Order Status Tracker ─────────────────────────────────────
function StatusTracker({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
        <span className="text-lg">✕</span>
        <div>
          <p className="text-sm font-bold text-rose-400">Order Cancelled</p>
          <p className="text-xs text-rose-400/60">This order has been cancelled</p>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="relative">
      {/* Connector line */}
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-700 hidden sm:block" />
      <div
        className="absolute top-4 left-4 h-0.5 bg-indigo-500 hidden sm:block transition-all duration-700"
        style={{ width: `${(currentIdx / (STATUS_STEPS.length - 1)) * 92}%` }}
      />

      <div className="flex items-start justify-between relative gap-2 sm:gap-0">
        {STATUS_STEPS.map((step, idx) => {
          const meta = STATUS_META[step];
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={step} className="flex flex-col items-center gap-2 z-10 flex-1">
              {/* Circle */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${isDone
                ? "bg-indigo-500 border-indigo-500 text-white"
                : isCurrent
                  ? `${meta.bg} ${meta.border} text-white ring-4 ring-white/10`
                  : "bg-slate-800 border-slate-700 text-slate-600"
                }`}>
                {isDone ? "✓" : isCurrent ? meta.icon : idx + 1}
              </div>
              {/* Label */}
              <p className={`text-xs font-semibold text-center leading-tight ${isCurrent ? meta.color : isDone ? "text-indigo-400" : "text-slate-600"
                }`}>
                {meta.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Review Form for one product ─────────────────────────────
function ReviewForm({
  orderId,
  item,
  existingReview,
  onSubmitted,
}: {
  orderId: string;
  item: OrderItem;
  existingReview?: Review;
  onSubmitted: (productId: string, rating: number, comment: string) => void;
}) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingReview);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!rating) { setError("Please select a star rating."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/orders/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, productId: item.productId, rating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        onSubmitted(item.productId, rating, comment);
      } else {
        setError(data.error || "Failed to submit review.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <span className="text-emerald-400 text-sm">✓</span>
        <div>
          <p className="text-xs font-semibold text-emerald-400">Review submitted</p>
          <div className="flex gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`text-xs ${s <= rating ? "text-amber-400" : "text-slate-600"}`}>★</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-3">
      <p className="text-xs font-semibold text-slate-300">Rate this product</p>

      <StarInput value={rating} onChange={setRating} />

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)…"
        rows={2}
        className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
      />

      {error && <p className="text-xs text-rose-400">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting…" : "Submit Review"}
      </button>
    </div>
  );
}

// ─── Single Order Card ────────────────────────────────────────
function OrderCard({ order: initialOrder }: { order: Order }) {
  const [order, setOrder] = useState(initialOrder);
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[order.orderStatus];
  const isDelivered = order.orderStatus === "delivered";

  const handleReviewSubmitted = (productId: string, rating: number, comment: string) => {
    setOrder((prev) => ({
      ...prev,
      reviews: [...prev.reviews, { productId, rating, comment }],
    }));
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── Card Header ── */}
      <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-base">
            {meta.icon}
          </div>
          <div>
            <p className="text-xs font-mono font-bold text-indigo-600">
              #{order._id.slice(-8).toUpperCase()}
            </p>
            <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Payment badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
            <span className="text-xs">{order.paymentMethod === "cod" ? "💵" : "💳"}</span>
            <span className={`text-xs font-semibold ${PAYMENT_META[order.paymentStatus].color}`}>
              {PAYMENT_META[order.paymentStatus].label}
            </span>
          </div>

          {/* Order status badge */}
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${order.orderStatus === "delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
            order.orderStatus === "cancelled" ? "bg-rose-50 text-rose-600 border-rose-200" :
              order.orderStatus === "shipped" ? "bg-sky-50 text-sky-600 border-sky-200" :
                order.orderStatus === "processing" ? "bg-amber-50 text-amber-600 border-amber-200" :
                  "bg-slate-50 text-slate-600 border-slate-200"
            }`}>
            {meta.label}
          </span>

          {/* Total */}
          <p className="text-sm font-black text-slate-800">${order.total.toFixed(2)}</p>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all"
          >
            <span className={`text-xs transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>▼</span>
          </button>
        </div>
      </div>

      {/* ── Expanded Body ── */}
      {expanded && (
        <div className="px-5 py-5 space-y-6">

          {/* Status tracker */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Order Progress
            </p>
            <StatusTracker status={order.orderStatus} />
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
            </p>
            <div className="space-y-3">
              {order.items.map((item, idx) => {
                const reviewed = order.reviews.find((r) => r.productId === item.productId);
                return (
                  <div key={idx} className="rounded-xl border border-slate-100 overflow-hidden">
                    <div className="flex items-center gap-3 p-3">
                      {/* Image */}
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>

                      <p className="text-sm font-bold text-indigo-600 shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Review section — only for delivered orders */}
                    {isDelivered && (
                      <div className="px-3 pb-3">
                        <ReviewForm
                          orderId={order._id}
                          item={item}
                          existingReview={reviewed}
                          onSubmitted={handleReviewSubmitted}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping + Summary row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Shipping address */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                📍 Shipping To
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {order.shippingAddress.fullName}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{order.shippingAddress.phone}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {order.shippingAddress.address}, {order.shippingAddress.city}
              </p>
              <p className="text-xs text-slate-500">
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
            </div>

            {/* Price summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                💰 Summary
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Shipping</span>
                  {(() => {
                    const shipping = order.total - order.subtotal;
                    return shipping > 0
                      ? <span className="text-slate-700">${shipping.toFixed(2)}</span>
                      : <span className="text-emerald-600">Free</span>;
                  })()}
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-800 border-t border-slate-200 pt-1.5">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-200" />
          <div className="space-y-1.5">
            <div className="h-3 w-28 bg-slate-200 rounded-full" />
            <div className="h-2.5 w-20 bg-slate-100 rounded-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-slate-200 rounded-full" />
          <div className="h-6 w-20 bg-slate-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════
export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/orders")
      .then((r) => r.json())
      .then((data) => { if (data.success) setOrders(data.orders); })
      .finally(() => setLoading(false));
  }, [status]);

  const filtered = filter === "all"
    ? orders
    : orders.filter((o) => o.orderStatus === filter);

  const filterTabs: { label: string; value: OrderStatus | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Processing", value: "processing" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  if (status === "loading") return null;

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-3xl mx-auto px-4">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-800">My Orders</h1>
          <p className="text-sm text-slate-400 mt-1">
            {loading ? "Loading…" : `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === tab.value
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-500"
                }`}
            >
              {tab.label}
              {tab.value !== "all" && orders.filter((o) => o.orderStatus === tab.value).length > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === tab.value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                  {orders.filter((o) => o.orderStatus === tab.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">
                {filter === "all" ? "No orders yet" : `No ${filter} orders`}
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                {filter === "all"
                  ? "Start shopping and your orders will appear here."
                  : "Try a different filter."}
              </p>
              {filter === "all" && (
                <Link
                  href="/products"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-colors"
                >
                  Shop Now
                </Link>
              )}
            </div>
          ) : (
            filtered.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

