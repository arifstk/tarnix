// components/Products.tsx

"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { fetchProducts, IProduct } from "@/store/slices/productSlice";
import { fetchCategories } from "@/store/slices/categorySlice";
import { addToCart } from "@/store/slices/cartSlice"; // ← import action
import ProductCard from "@/components/ProductCard";

type SortKey = "newest" | "price-asc" | "price-desc" | "rating";

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

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { items: products, loading, error } = useSelector(
    (s: RootState) => s.products
  );

  const categories = useSelector((s: RootState) => {
    const slice = (s as any).categories;
    if (!slice || !Array.isArray(slice.items)) return [] as { _id: string; name: string }[];
    return slice.items as { _id: string; name: string }[];
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const activeProducts = products.filter((p) => p.status === "active");

  const filtered = activeProducts
    .filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchCat =
        category === "all" ||
        (typeof p.category === "string"
          ? p.category === category
          : p.category._id === category);

      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
        case "price-desc":
          return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const hasFilters = search !== "" || category !== "all";
  const pageSize = 12;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // ─── Add to Cart handler ───────────────────────────────────────────────────
  // Maps IProduct → CartItem shape and dispatches to the cart Redux slice.
  // Also shows a brief "Added!" flash on the button via `addedId` state.
  const handleAddToCart = (product: IProduct) => {
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        discountedPrice: product.discountedPrice,
        image: product.images?.[0]?.url || "",
        quantity: 1,
      })
    );

    // Show brief visual feedback on the card
    setAddedIds((prev) => new Set(prev).add(product._id));
  };
  // ───────────────────────────────

  const Pagination = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className={`px-3 py-1 rounded-md border border-slate-200 text-sm ${currentPage === 1
            ? "text-slate-400 cursor-not-allowed opacity-50"
            : "text-slate-600 hover:bg-slate-100 cursor-pointer"
            }`}
        >
          Prev
        </button>
        {pages.map((num) => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)}
            className={`px-3 py-1 rounded-md text-sm ${currentPage === num
              ? "bg-indigo-600 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
              }`}
          >
            {num}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className={`px-3 py-1 rounded-md border border-slate-200 text-sm ${currentPage === totalPages
            ? "text-slate-400 cursor-not-allowed opacity-50"
            : "text-slate-600 hover:bg-slate-100 cursor-pointer"
            }`}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-1 pt-4 pb-10">

        <div className="mb-2">
          <p className="text-sm text-slate-500 text-center">
            {loading
              ? "Loading…"
              : `${activeProducts.length} item${activeProducts.length !== 1 ? "s" : ""} available`}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <div className="relative flex-1 min-w-45 max-w-xs">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>

          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setCategory("all"); }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all"
            >
              Clear ✕
            </button>
          )}

          {hasFilters && !loading && (
            <span className="text-sm text-slate-400 ml-auto">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 mb-8 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600 font-medium">
            <span>⚠</span>
            <span>{error} — please try refreshing the page.</span>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Product Grid — passes addedId so card can show "Added!" flash */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-5">
            {paginated.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                isAdded={addedIds.has(product._id)} // ← flash feedback prop
              />
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && <Pagination />}

        {!loading && filtered.length === 0 && !error && (
          <div className="py-24 text-center">
            <div className="text-6xl mb-4">{hasFilters ? "🔍" : "📦"}</div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              {hasFilters ? "No products match your filters" : "No products available"}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {hasFilters
                ? "Try adjusting your search or category."
                : "Check back soon — new products are on their way!"}
            </p>
            {hasFilters && (
              <button
                onClick={() => { setSearch(""); setCategory("all"); }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
