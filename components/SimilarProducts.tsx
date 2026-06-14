// components/SimilarProducts.tsx

"use client";
import { useSelector } from "react-redux";
import { IProduct } from "@/store/slices/productSlice";
import ProductCard from "./ProductCard";

interface SimilarProductsProps {
  currentProductId: string;
  category: string;
  onAddToCart: (product: IProduct) => void;
  // If you are already tracking cart items globally to check the `isAdded` check
  cartItems: any[];
}

export default function SimilarProducts({
  currentProductId,
  category,
  onAddToCart,
  cartItems,
}: SimilarProductsProps) {

  // 1. Fetch all products from your Redux product slice
  // Note: Adjust 'state.products.items' to match your exact slice structure
  const allProducts = useSelector((state: any) => state.products.items || []);

  // 2. Filter: Must match category AND must not be the active detail product
  const similarProducts = allProducts
    .filter((product: IProduct) => {
      const prodCategory = typeof product.category === "string"
        ? product.category
        : product.category?.name;

      return prodCategory === category && product._id !== currentProductId;
    })
    .slice(0, 4); // Limit down to a clean grid layout of 4 items max

  if (similarProducts.length === 0) return null; // Gracefully hide section if none found

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 border-t border-slate-200/60">
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          Similar Products
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Customers who viewed this item also explored these options from <span className="font-medium text-indigo-500 uppercase">{category}</span>
        </p>
      </div>

      {/* Responsive Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {similarProducts.map((prod: IProduct) => {
          // Check if item is already added to the cart
          const isAdded = cartItems.some((item: any) => item._id === prod._id);

          return (
            <ProductCard
              key={prod._id}
              product={prod}
              onAddToCart={onAddToCart}
              isAdded={isAdded}
            />
          );
        })}
      </div>
    </section>
  );
}

