// components/NewProducts.tsx

"use client";
import { useEffect, useRef, useState } from "react";
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

interface NewProduct {
  totalSold: number;
  daysAgo: number;
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
    createdAt: string;
    category: { _id: string; name: string } | null;
  };
}

// ─── Helpers ─────────────────────────────────────────────────
function daysAgoLabel(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function newBadgeColor(days: number): string {
  if (days === 0) return "bg-rose-500";
  if (days <= 3) return "bg-orange-500";
  if (days <= 7) return "bg-amber-500";
  return "bg-indigo-500";
}

// ─── Skeleton ─────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm animate-pulse shrink-0 w-48 sm:w-56">
    <div className="aspect-4/3 bg-slate-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-1/3 bg-slate-200 rounded-full" />
      <div className="h-4 w-4/5 bg-slate-200 rounded-full" />
      <div className="h-3 w-1/2 bg-slate-200 rounded-full" />
      <div className="h-9 bg-slate-100 rounded-xl mt-2" />
    </div>
  </div>
);

// ─── Single Card ──────────────────────────────────────────────
function NewProductCard({ item }: { item: NewProduct }) {
  const dispatch = useDispatch();
  const { product } = item;

  const cartItems = useSelector((s: RootState) => s.cart.items);
  const isAdded = cartItems.some((c) => c._id === product._id);

  const imageSrc = product.images?.[0]?.url || null;
  const displayPrice = product.discountedPrice > 0 ? product.discountedPrice : product.price;
  const hasDiscount = product.discountRate > 0;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 20;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdded) return;
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
    <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col shrink-0 w-48 sm:w-56">

      {/* ── Image ── */}
      <div className="relative aspect-4/3 bg-slate-100">
        <Link href={`/products/${product._id}`}>
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-300 hover:scale-105 ${isOutOfStock ? "opacity-50" : ""
                }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">
              📦
            </div>
          )}
        </Link>

        {/* NEW badge — top left */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-full shadow ${newBadgeColor(item.daysAgo)}`}>
            NEW
          </span>
        </div>

        {/* Days ago — below NEW badge */}
        <div className="absolute top-7 left-2">
          <span className="text-[9px] font-semibold bg-black/40 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            {daysAgoLabel(item.daysAgo)}
          </span>
        </div>

        {/* Discount badge — top right */}
        {hasDiscount && (
          <div className="absolute top-2 right-2">
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-rose-500 text-white shadow-sm">
              -{product.discountRate}%
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-800/80 text-white tracking-wide">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-3 flex flex-col flex-1 gap-1">

        {/* Category */}
        <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide truncate">
          {product.category?.name || ""}
        </p>

        {/* Name */}
        <Link href={`/products/${product._id}`}>
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating > 0 && (
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
        )}

        {/* Stock + sold */}
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOutOfStock ? "bg-rose-500" : isLowStock ? "bg-amber-400" : "bg-emerald-500"
              }`} />
            <span className={`text-xs font-medium ${isOutOfStock ? "text-rose-500" : isLowStock ? "text-amber-500" : "text-slate-400"
              }`}>
              {isOutOfStock
                ? "Out of stock"
                : isLowStock
                  ? `${product.stock} left`
                  : "In stock"}
            </span>
          </div>

          {item.totalSold > 0 && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
              ↑{item.totalSold}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-1.5 mt-auto pt-1">
          <span className="text-sm font-black text-indigo-600">
            ${displayPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdded}
          className={`mt-1 w-full py-2 rounded-xl text-xs font-bold active:scale-95 transition-all ${isOutOfStock
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : isAdded
              ? "bg-emerald-500 text-white cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
            }`}
        >
          {isOutOfStock ? "Out of Stock" : isAdded ? "✓ Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
interface NewProductsProps {
  limit?: number;
  title?: string;
  showSubtitle?: boolean;
  layout?: "scroll" | "grid"; // horizontal scroll or grid
}

export default function NewArrivals({
  limit = 20,
  title = "New Arrivals",
  showSubtitle = true,
  layout = "scroll",
}: NewProductsProps) {
  const [products, setProducts] = useState<NewProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/products/new-arrivals?limit=${limit}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProducts(data.products);
        else setError(data.error || "Failed to load.");
      })
      .catch(() => setError("Something went wrong."))
      .finally(() => setLoading(false));
  }, [limit]);

  // ── Scroll helpers ──
  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <section className="py-10">

      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">✨</span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {title}
            </h2>
          </div>
          {showSubtitle && (
            <p className="text-sm text-slate-400">
              Fresh arrivals — just added to the store
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Scroll arrows — only in scroll layout */}
          {layout === "scroll" && (
            <>
              <button
                onClick={scrollLeft}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all"
              >
                ‹
              </button>
              <button
                onClick={scrollRight}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all"
              >
                ›
              </button>
            </>
          )}
          <Link
            href="/products"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-colors"
          >
            View all →
          </Link>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600 mb-6">
          ⚠ {error}
        </div>
      )}

      {/* ── Scroll layout ── */}
      {layout === "scroll" && (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.length === 0
              ? (
                <div className="w-full text-center py-16">
                  <div className="text-5xl mb-3">✨</div>
                  <p className="text-slate-500 text-sm font-semibold">
                    No products yet — check back soon!
                  </p>
                </div>
              )
              : products.map((item) => (
                <NewProductCard key={item.product._id} item={item} />
              ))}
        </div>
      )}

      {/* ── Grid layout ── */}
      {layout === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm animate-pulse">
                <div className="aspect-4/3 bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-1/3 bg-slate-200 rounded-full" />
                  <div className="h-4 w-4/5 bg-slate-200 rounded-full" />
                  <div className="h-9 bg-slate-100 rounded-xl mt-2" />
                </div>
              </div>
            ))
            : products.length === 0
              ? (
                <div className="col-span-full text-center py-16">
                  <div className="text-5xl mb-3">✨</div>
                  <p className="text-slate-500 text-sm font-semibold">
                    No products yet — check back soon!
                  </p>
                </div>
              )
              : products.map((item) => (
                <NewProductCard key={item.product._id} item={item} />
              ))}
        </div>
      )}

    </section>
  );
}

