// components/TopSellingProducts.tsx

"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/slices/cartSlice";
import type { RootState } from "@/store";

// ─── Types ────────────────────────────────────────────────────
interface ProductImage {
  url: string;
  cloudinaryId: string;
}

interface TopProduct {
  productId: string;
  totalSold: number;
  totalRevenue: number;
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    discountRate: number;
    discountedPrice: number;
    stock: number;
    images: ProductImage[];
    tags: string[];
    rating: number;
    ratingCount: number;
    status: string;
    category: { _id: string; name: string } | null;
  };
}

// ─── Rank badge colors ────────────────────────────────────────
const RANK_STYLES: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: "bg-amber-400", text: "text-amber-900", label: "🥇" },
  2: { bg: "bg-slate-300", text: "text-slate-700", label: "🥈" },
  3: { bg: "bg-orange-400", text: "text-orange-900", label: "🥉" },
};

// ─── Skeleton card ────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm animate-pulse">
    <div className="aspect-square bg-slate-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-1/3 bg-slate-200 rounded-full" />
      <div className="h-4 w-4/5 bg-slate-200 rounded-full" />
      <div className="h-3 w-1/2 bg-slate-200 rounded-full" />
      <div className="h-9 bg-slate-100 rounded-xl mt-2" />
    </div>
  </div>
);

// ─── Single product card ──────────────────────────────────────
function TopProductCard({
  item,
  rank,
}: {
  item: TopProduct;
  rank: number;
}) {
  const dispatch = useDispatch();
  const { product } = item;

  const cartItems = useSelector((s: RootState) => s.cart.items);
  const isInCart = cartItems.some((c) => c._id === product._id);

  const imageSrc = product.images?.[0]?.url || null;
  const displayPrice = product.discountedPrice > 0 ? product.discountedPrice : product.price;
  const hasDiscount = product.discountRate > 0;
  const inStock = product.stock > 0;
  const rankStyle = RANK_STYLES[rank];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        discountedPrice: product.discountedPrice,
        image: imageSrc || "",
        quantity: 1,
      })
    );
  };

  return (
    <Link
      href={`/products/${product._id}`}
      className="group relative rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      {/* ── Image ── */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-50">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-slate-200">
            📦
          </div>
        )}

        {/* Rank badge */}
        <div className={`absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black shadow-md ${rankStyle
          ? `${rankStyle.bg} ${rankStyle.text}`
          : "bg-white/90 text-slate-600 border border-slate-200"
          }`}>
          {rankStyle ? rankStyle.label : `#${rank}`}
          <span>{rankStyle ? `#${rank}` : ""}</span>
        </div>

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-2.5 right-2.5 bg-rose-500 text-white text-xs font-black px-2 py-0.5 rounded-full shadow">
            -{product.discountRate}%
          </div>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-4 flex flex-col gap-2 flex-1">

        {/* Category */}
        {product.category && (
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide">
            {product.category.name}
          </p>
        )}

        {/* Name */}
        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating + sold count */}
        <div className="flex items-center justify-between gap-2">
          {product.rating > 0 ? (
            <div className="flex items-center gap-1">
              <span className="text-amber-400 text-xs">★</span>
              <span className="text-xs font-semibold text-slate-600">
                {product.rating.toFixed(1)}
              </span>
              {product.ratingCount > 0 && (
                <span className="text-xs text-slate-400">
                  ({product.ratingCount})
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-400">No ratings</span>
          )}

          {/* Sold count */}
          <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
            <span className="text-emerald-500 text-xs">↑</span>
            <span className="text-xs font-bold text-emerald-600">
              {item.totalSold} sold
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <span className="text-base font-black text-slate-800">
            ${displayPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`mt-1 w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:cursor-not-allowed ${isInCart
            ? "bg-emerald-500 text-white"
            : inStock
              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-200"
              : "bg-slate-100 text-slate-400"
            }`}
        >
          {isInCart ? "✓ In Cart" : inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT — drop this anywhere on any page
// ═══════════════════════════════════════════════════════════════
interface TopSellingProductsProps {
  limit?: number;  // how many products to show (default 8)
  title?: string;  // section heading
  showSubtitle?: boolean;
}

export default function TopSellingProducts({
  limit = 8,
  title = "Top Selling Products",
  showSubtitle = true,
}: TopSellingProductsProps) {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/products/top-selling?limit=${limit}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProducts(data.products);
        else setError(data.error || "Failed to load products.");
      })
      .catch(() => setError("Something went wrong."))
      .finally(() => setLoading(false));
  }, [limit]);

  return (
    <section className="py-10">

      {/* ── Section header ── */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🔥</span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {title}
            </h2>
          </div>
          {showSubtitle && (
            <p className="text-sm text-slate-400">
              Based on actual sales — most ordered by our customers
            </p>
          )}
        </div>
        <Link
          href="/products"
          className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-colors"
        >
          View all
          <span className="text-base">→</span>
        </Link>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600 mb-6">
          ⚠ {error}
        </div>
      )}

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-10">
        {loading
          ? Array.from({ length: limit > 5 ? 5 : limit }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
          : products.length === 0 && !error
            ? (
              <div className="col-span-full text-center py-16">
                <div className="text-5xl mb-3">📦</div>
                <p className="text-slate-500 text-sm font-semibold">
                  No sales data yet — products will appear here once orders are delivered.
                </p>
              </div>
            )
            : products.map((item, idx) => (
              <TopProductCard
                key={item.productId}
                item={item}
                rank={idx + 1}
              />
            ))}
      </div>

    </section>
  );
}
