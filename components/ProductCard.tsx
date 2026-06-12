// components/ProductCard.tsx

"use client";
import Image from "next/image";
import { IProduct } from "@/store/slices/productSlice";

interface Props {
  product: IProduct;
  onAddToCart: (product: IProduct) => void;
  isAdded?: boolean;
}

export default function ProductCard({ product, onAddToCart, isAdded }: Props) {
  const displayPrice = product.discountedPrice || product.price;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
 const imageSrc = product.images?.[0]?.url || null;

  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Image */}
      <div className="relative aspect-4/3 bg-slate-100">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">
            📦
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-1">
        {/* Category label */}
        <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide">
          {typeof product.category === "string"
            ? product.category
            : product.category?.name}
        </p>

        {/* Name */}
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating != null && (
          <p className="text-xs text-amber-500 font-medium">
            ★ {product.rating.toFixed(1)}
          </p>
        )}

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

        {/* Add to Cart button */}
        {/* <button
          onClick={() => onAddToCart(product)}
          className="mt-2 w-full py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 active:scale-95 transition-all"
        >
          Add to Cart
        </button> */}
        <button
          onClick={() => onAddToCart(product)}
          className={`mt-2 w-full py-2 rounded-xl text-sm font-semibold active:scale-95 transition-all ${isAdded
            ? "bg-emerald-500 text-white"       // flash green when just added
            : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
        >
          {isAdded ? "✓ Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}