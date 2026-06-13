// // components/ProductCard.tsx

// "use client";
// import Image from "next/image";
// import { IProduct } from "@/store/slices/productSlice";

// interface Props {
//   product: IProduct;
//   onAddToCart: (product: IProduct) => void;
//   isAdded?: boolean;
// }

// export default function ProductCard({ product, onAddToCart, isAdded }: Props) {
//   const displayPrice = product.discountedPrice || product.price;
//   const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
//  const imageSrc = product.images?.[0]?.url || null;

//   return (
//     <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
//       {/* Image */}
//       <div className="relative aspect-4/3 bg-slate-100">
//         {imageSrc ? (
//           <Image
//             src={imageSrc}
//             alt={product.name}
//             fill
//             className="object-cover"
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">
//             📦
//           </div>
//         )}
//       </div>

//       {/* Body */}
//       <div className="p-4 flex flex-col flex-1 gap-1">
//         {/* Category label */}
//         <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide">
//           {typeof product.category === "string"
//             ? product.category
//             : product.category?.name}
//         </p>

//         {/* Name */}
//         <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
//           {product.name}
//         </h3>

//         {/* Rating */}
//         {product.rating != null && (
//           <p className="text-xs text-amber-500 font-medium">
//             ★ {product.rating.toFixed(1)}
//           </p>
//         )}

//         {/* Price */}
//         <div className="flex items-center gap-2 mt-auto pt-2">
//           <span className="text-base font-bold text-indigo-600">
//             ${displayPrice.toFixed(2)}
//           </span>
//           {hasDiscount && (
//             <span className="text-xs text-slate-400 line-through">
//               ${product.price.toFixed(2)}
//             </span>
//           )}
//         </div>

//         {/* Add to Cart button */}
//         {/* <button
//           onClick={() => onAddToCart(product)}
//           className="mt-2 w-full py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 active:scale-95 transition-all"
//         >
//           Add to Cart
//         </button> */}
//         <button
//           onClick={() => onAddToCart(product)}
//           className={`mt-2 w-full py-2 rounded-xl text-sm font-semibold active:scale-95 transition-all ${isAdded
//             ? "bg-emerald-500 text-white"       // flash green when just added
//             : "bg-indigo-600 text-white hover:bg-indigo-500"
//             }`}
//         >
//           {isAdded ? "✓ Added!" : "Add to Cart"}
//         </button>
//       </div>
//     </div>
//   );
// }



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
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 20;

  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Image */}
      <div className="relative aspect-4/3 bg-slate-100">
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

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5">
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

        {/* Stock status */}
        <div className="flex items-center gap-1.5 mt-1">
          <div
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOutOfStock
                ? "bg-rose-500"
                : isLowStock
                  ? "bg-amber-400"
                  : "bg-emerald-500"
              }`}
          />
          <span
            className={`text-xs font-medium ${isOutOfStock
                ? "text-rose-500"
                : isLowStock
                  ? "text-amber-500"
                  : "text-slate-400"
              }`}
          >
            {isOutOfStock
              ? "Out of stock"
              : isLowStock
                ? `Only ${product.stock} left`
                : `${product.stock} in stock`}
          </span>
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

        {/* Add to Cart button */}
        <button
          onClick={() => !isOutOfStock && onAddToCart(product)}
          disabled={isOutOfStock}
          className={`mt-2 w-full py-2 rounded-xl text-sm font-semibold active:scale-95 transition-all ${isOutOfStock
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : isAdded
                ? "bg-emerald-500 text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
        >
          {isOutOfStock ? "Out of Stock" : isAdded ? "✓ Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}


