// components/TopRatedProducts.tsx
// CHANGELOG: Fetches top rated products, matches ProductCard.tsx style exactly,
//            adds star rating display, review count, sold count badge

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

interface RatedProduct {
  totalSold: number;
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

// ─── Star display ─────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= Math.floor(rating);
        const half = !filled && s === Math.ceil(rating) && rating % 1 >= 0.5;
        return (
          <span
            key={s}
            className={`text-sm leading-none ${filled ? "text-amber-400" : half ? "text-amber-300" : "text-slate-200"
              }`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm animate-pulse">
    <div className="aspect-4/3 bg-slate-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-1/3 bg-slate-200 rounded-full" />
      <div className="h-4 w-4/5 bg-slate-200 rounded-full" />
      <div className="h-3 w-1/2 bg-slate-200 rounded-full" />
      <div className="h-10 bg-slate-100 rounded-xl mt-4" />
    </div>
  </div>
);

// ─── Single Card ──────────────────────────────────────────────
function RatedProductCard({
  item,
  rank,
}: {
  item: RatedProduct;
  rank: number;
}) {
  const dispatch = useDispatch();
  const { product } = item;

  const cartItems = useSelector((s: RootState) => s.cart.items);
  const isAdded = cartItems.some((c) => c._id === product._id);

  const imageSrc = product.images?.[0]?.url || null;
  const displayPrice = product.discountedPrice > 0 ? product.discountedPrice : product.price;
  const hasDiscount = product.discountRate > 0;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 20;

  // Rating label
  const ratingLabel =
    product.rating >= 4.5 ? { text: "Excellent", bg: "bg-emerald-500" } :
      product.rating >= 4.0 ? { text: "Very Good", bg: "bg-teal-500" } :
        product.rating >= 3.5 ? { text: "Good", bg: "bg-sky-500" } :
          { text: "Average", bg: "bg-slate-400" };

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
    <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">

      {/* ── Image ── */}
      <div className="relative aspect-4/3 bg-slate-100">
        <Link href={`/products/${product._id}`}>
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className={`object-cover ${isOutOfStock ? "opacity-50" : ""}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">
              📦
            </div>
          )}
        </Link>

        {/* Rating badge — top left */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/95 border border-amber-100 px-2 py-1 rounded-full shadow-sm">
          <span className="text-amber-400 text-xs leading-none">★</span>
          <span className="text-xs font-black text-slate-700">
            {product.rating.toFixed(1)}
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
      <div className="p-4 flex flex-col flex-1 gap-1">

        {/* Category */}
        <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide">
          {product.category?.name || ""}
        </p>

        {/* Name */}
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Stars + rating label + review count */}
        <div className="flex items-center gap-2 flex-wrap">
          <StarRating rating={product.rating} />
          <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full ${ratingLabel.bg}`}>
            {ratingLabel.text}
          </span>
          <span className="text-xs text-slate-400">
            ({product.ratingCount} review{product.ratingCount !== 1 ? "s" : ""})
          </span>
        </div>

        {/* Stock + sold count */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOutOfStock ? "bg-rose-500" : isLowStock ? "bg-amber-400" : "bg-emerald-500"
              }`} />
            <span className={`text-xs font-medium ${isOutOfStock ? "text-rose-500" : isLowStock ? "text-amber-500" : "text-slate-400"
              }`}>
              {isOutOfStock
                ? "Out of stock"
                : isLowStock
                  ? `Only ${product.stock} left`
                  : `${product.stock} in stock`}
            </span>
          </div>

          {/* Sold count */}
          {item.totalSold > 0 && (
            <div className="flex items-center gap-0.5 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              <span className="text-emerald-500 text-xs">↑</span>
              <span className="text-xs font-bold text-emerald-600">
                {item.totalSold} sold
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          <span className="text-base font-bold text-indigo-600">
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
          className={`mt-2 w-full py-2 rounded-xl text-sm font-semibold active:scale-95 transition-all ${isOutOfStock
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
// MAIN EXPORT — drop anywhere
// ═══════════════════════════════════════════════════════════════
interface TopRatedProductsProps {
  layout?: "scroll" | "grid";
  limit?: number;
  minRatings?: number; // minimum reviews needed to qualify
  title?: string;
  showSubtitle?: boolean;
}

export default function TopRatedProducts({
  limit = 8,
  minRatings = 1,
  title = "Top Rated Products",
  showSubtitle = true,
}: TopRatedProductsProps) {
  const [products, setProducts] = useState<RatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/products/top-rated?limit=${limit}&minRatings=${minRatings}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProducts(data.products);
        else setError(data.error || "Failed to load.");
      })
      .catch(() => setError("Something went wrong."))
      .finally(() => setLoading(false));
  }, [limit, minRatings]);

  return (
    <section className="py-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">⭐</span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {title}
            </h2>
          </div>
          {showSubtitle && (
            <p className="text-sm text-slate-400">
              Highest rated by verified buyers — reviews only
            </p>
          )}
        </div>
        <Link
          href="/products?sort=rating"
          className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600 mb-6">
          ⚠ {error}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-10">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : products.length === 0 && !error ? (
          <div className="col-span-full text-center py-16">
            <div className="text-5xl mb-3">⭐</div>
            <p className="text-slate-500 text-sm font-semibold">
              No rated products yet — ratings appear after customers review purchased items.
            </p>
          </div>
        ) : (
          products.map((item, idx) => (
            <RatedProductCard key={item.product._id} item={item} rank={idx + 1} />
          ))
        )}
      </div>

    </section>
  );
}

