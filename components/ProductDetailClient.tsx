// components/ProductDetailClient.tsx
// CHANGELOG: Client component — image gallery, add to cart, reviews section

"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/slices/cartSlice";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────
interface ProductImage {
  url: string;
  cloudinaryId: string;
}

interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountRate: number;
  discountedPrice?: number;
  stock: number;
  images: ProductImage[];
  category: { _id: string; name: string } | string;
  status: "active" | "draft";
  tags: string[];
  sku: string;
  rating: number;
  ratingCount: number;
  createdAt: string;
}

interface Review {
  rating: number;
  comment: string;
  submittedAt: string;
  reviewer: string;
  userEmail: string;
}

interface Props {
  product: IProduct;
  reviews: Review[];
}

// ─── Helpers ─────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    "from-indigo-500 to-violet-600",
    "from-sky-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-purple-500 to-fuchsia-600",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Star display ─────────────────────────────────────────────
function Stars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-xl" };
  return (
    <div className={`flex gap-0.5 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={
            s <= Math.round(rating) ? "text-amber-400" : "text-slate-200"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ─── Rating bar breakdown ─────────────────────────────────────
function RatingBar({
  star,
  count,
  total,
}: {
  star: number;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-4 text-right">{star}</span>
      <span className="text-amber-400 text-xs">★</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 w-4">{count}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
export default function ProductDetailClient({ product, reviews }: Props) {
  const dispatch = useDispatch();

  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  const images = product.images || [];
  const category =
    typeof product.category === "string"
      ? product.category
      : product.category?.name;

  const hasDiscount = product.discountRate > 0 && product.discountedPrice != null;
  const displayPrice = hasDiscount ? product.discountedPrice! : product.price;
  const inStock = product.stock > 0;

  // Rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  // ── Add to cart ──
  const handleAddToCart = () => {
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        discountedPrice: product.discountedPrice,
        image: images[0]?.url || "",
        quantity,
      })
    );
    setAddedToCart(true);
    toast.success("Added to cart!");
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ── Breadcrumb ── */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-indigo-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-indigo-500 transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium truncate max-w-50">
            {product.name}
          </span>
        </nav>
      </div>

      {/* ── Main section ── */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ════ LEFT — Image Gallery ════ */}
          <div className="space-y-3">

            {/* Main image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm group">
              {images.length > 0 && !imgError[activeImg] ? (
                <Image
                  src={images[activeImg].url}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                  onError={() => setImgError((p) => ({ ...p, [activeImg]: true }))}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl bg-slate-50">
                  📦
                </div>
              )}

              {/* Discount badge */}
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                  -{product.discountRate}% OFF
                </div>
              )}

              {/* Stock badge */}
              {!inStock && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-full">
                    Out of Stock
                  </span>
                </div>
              )}

              {/* Nav arrows — only if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-slate-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveImg((p) => (p + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-slate-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip — up to 4 */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImg === idx
                        ? "border-indigo-500 shadow-md shadow-indigo-100"
                        : "border-transparent hover:border-slate-300"
                      }`}
                  >
                    {!imgError[idx] ? (
                      <Image
                        src={img.url}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                        onError={() => setImgError((p) => ({ ...p, [idx]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-2xl">📦</div>
                    )}
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* ════ RIGHT — Product Info ════ */}
          <div className="flex flex-col gap-5">

            {/* Category + status */}
            <div className="flex items-center gap-2 flex-wrap">
              {category && (
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wide">
                  {category}
                </span>
              )}
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${product.status === "active"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                {product.status === "active" ? "In Store" : "Draft"}
              </span>
              {product.sku && (
                <span className="text-xs text-slate-400 font-mono">
                  SKU: {product.sku}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-3">
              <Stars rating={product.rating} size="md" />
              <span className="text-sm font-bold text-slate-700">
                {product.rating > 0 ? product.rating.toFixed(1) : "No ratings"}
              </span>
              <span className="text-sm text-slate-400">
                ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-slate-800">
                ${displayPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-slate-400 line-through mb-0.5">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-0.5">
                    Save ${(product.price - displayPrice).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100" />

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${inStock ? "bg-emerald-500" : "bg-rose-500"}`} />
              <span className={`text-sm font-semibold ${inStock ? "text-emerald-600" : "text-rose-500"}`}>
                {inStock
                  ? product.stock < 10
                    ? `Only ${product.stock} left in stock!`
                    : `${product.stock} in stock`
                  : "Out of stock"}
              </span>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-slate-100" />

            {/* Quantity + Add to cart */}
            <div className="space-y-3">
              {/* Quantity */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-600">Quantity</span>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="text-sm font-bold text-slate-800 min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || addedToCart}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:cursor-not-allowed ${addedToCart
                      ? "bg-emerald-500 text-white"
                      : inStock
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-200"
                        : "bg-slate-200 text-slate-400"
                    }`}
                >
                  {addedToCart ? "✓ Added to Cart!" : inStock ? "Add to Cart 🛒" : "Out of Stock"}
                </button>

                <Link
                  href="/cart"
                  className="px-5 py-3.5 rounded-xl font-bold text-sm bg-white border-2 border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 transition-all text-center"
                >
                  View Cart
                </Link>
              </div>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { icon: "🚚", label: "Free Shipping" },
                { icon: "↩️", label: "Easy Returns" },
                { icon: "🔒", label: "Secure Payment" },
              ].map((p) => (
                <div
                  key={p.label}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-slate-100 text-center"
                >
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-xs font-semibold text-slate-500">{p.label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ════ REVIEWS SECTION ════ */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="h-px bg-slate-200 mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Rating summary sidebar ── */}
          <div className="space-y-5">
            <h2 className="text-xl font-black text-slate-800">
              Customer Reviews
            </h2>

            {reviews.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-slate-100 text-center">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm font-semibold text-slate-600">No reviews yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Be the first to review this product after purchase.
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
                {/* Overall */}
                <div className="text-center pb-4 border-b border-slate-100">
                  <p className="text-5xl font-black text-slate-800">
                    {product.rating > 0 ? product.rating.toFixed(1) : "—"}
                  </p>
                  <Stars rating={product.rating} size="lg" />
                  <p className="text-xs text-slate-400 mt-1">
                    Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Breakdown */}
                <div className="space-y-2">
                  {ratingBreakdown.map(({ star, count }) => (
                    <RatingBar
                      key={star}
                      star={star}
                      count={count}
                      total={reviews.length}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Review list ── */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="hidden lg:block" />
            ) : (
              reviews.map((review, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3"
                >
                  {/* Reviewer header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full bg-linear-to-br ${getAvatarColor(review.reviewer)} flex items-center justify-center text-white text-sm font-black shrink-0`}>
                        {getInitials(review.reviewer)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {review.reviewer}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDate(review.submittedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Verified badge */}
                    <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full shrink-0">
                      <span className="text-emerald-500 text-xs">✓</span>
                      <span className="text-xs font-semibold text-emerald-600">
                        Verified Purchase
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <Stars rating={review.rating} size="sm" />

                  {/* Comment */}
                  {review.comment ? (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {review.comment}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">
                      No written review.
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </main>
  );
}

