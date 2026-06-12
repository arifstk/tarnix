// components/ProductCard.tsx
"use client";

import { IProduct } from "@/store/slices/productSlice";

// ─── Helpers ──────────────────────────────────────────────────

const getCategoryName = (category: IProduct["category"]): string =>
  typeof category === "string" ? category : category?.name ?? "";

const getMainImage = (product: IProduct): string =>
  product.images?.[0]?.url || product.imageUrl || "";

// ─── Star Rating ──────────────────────────────────────────────

const StarRating = ({ value }: { value: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`text-sm leading-none ${star <= Math.round(value) ? "text-amber-400" : "text-slate-200"
          }`}
      >
        ★
      </span>
    ))}
  </div>
);

// ─── ProductCard ──────────────────────────────────────────────

interface ProductCardProps {
  product: IProduct;
  onAddToCart?: (product: IProduct) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const mainImage = getMainImage(product);
  const catName = getCategoryName(product.category);
  const hasDiscount = product.discountRate > 0;
  const finalPrice = hasDiscount
    ? product.discountedPrice
    : product.price;

  return (
    <div className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

      {/* ── Image ── */}
      <div className="relative aspect-4/3 bg-slate-50 overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-slate-200">
            📦
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500 text-white shadow">
              -{product.discountRate}%
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-sm font-bold px-4 py-1.5 rounded-full bg-slate-900/70 text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-2 gap-2">

        {/* Category */}
        {catName && (
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
            {catName}
          </p>
        )}

        {/* Name */}
        <h3 className="text-sm font-bold text-slate-700 leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating value={product.rating} />
            <span className="text-xs text-slate-400 font-medium">
              {product.rating.toFixed(1)}
              {product.ratingCount > 0 && (
                <span className="text-slate-300"> ({product.ratingCount})</span>
              )}
            </span>
          </div>
        )}

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Price + Stock ── */}
        <div className="flex items-end justify-between mt-auto pt-2 border-t border-slate-100">
          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-slate-900">
              ${finalPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock dot */}
          <div className="flex items-center gap-1">
            <div
              className={`w-1.5 h-1.5 rounded-full ${product.stock === 0
                ? "bg-rose-500"
                : product.stock < 20
                  ? "bg-amber-400"
                  : "bg-emerald-500"
                }`}
            />
            <span
              className={`text-xs font-medium ${product.stock === 0
                ? "text-rose-500"
                : product.stock < 20
                  ? "text-amber-500"
                  : "text-slate-400"
                }`}
            >
              {product.stock === 0
                ? "Sold out"
                : product.stock < 20
                  ? `${product.stock} left`
                  : "In stock"}
            </span>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          disabled={product.stock === 0}
          onClick={() => onAddToCart?.(product)}
          className="w-full mt-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95
            bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-200
            disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

