// components/RecentlyViewed.tsx

"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IProduct } from "@/store/slices/productSlice";
import ProductCard from "./ProductCard";

interface RecentlyViewedProps {
  currentProductId: string;
  onAddToCart: (product: IProduct) => void;
  cartItems: any[];
}

export default function RecentlyViewed({
  currentProductId,
  onAddToCart,
  cartItems,
}: RecentlyViewedProps) {
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  
  // Fetch your global catalog array from Redux
  const allProducts = useSelector((state: any) => state.products.items || []);

  useEffect(() => {
    // Read historical logs from localStorage safely on client side mount
    const history = localStorage.getItem("recentlyViewed");
    if (history) {
      try {
        const parsedIds = JSON.parse(history) as string[];
        // Filter out the current active product ID so we aren't recommending what's already on screen
        setViewedIds(parsedIds.filter((id) => id !== currentProductId));
      } catch (e) {
        console.error("Failed parsing viewing history records", e);
      }
    }
  }, [currentProductId]);

  // Match saved string IDs back to full Redux product data models
  const recentlyViewedProducts = viewedIds
    .map((id) => allProducts.find((p: IProduct) => p._id === id))
    .filter((p): p is IProduct => !!p) // clear undefined values if products are removed from store
    .slice(0, 4); // Restrict layout space cleanly to max 4 cards

  if (recentlyViewedProducts.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 border-t border-slate-200/60">
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          Recently Viewed
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Items you checked out during your browsing session.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recentlyViewedProducts.map((prod: IProduct) => {
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