// app/order-success/page.tsx
"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("id");

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Order Placed!</h1>
        <p className="text-sm text-slate-500 mb-2">
          Thank you for your purchase. We'll get it shipped out soon.
        </p>
        {orderId && (
          <p className="text-xs text-slate-400 mb-6 font-mono bg-slate-50 px-3 py-2 rounded-lg">
            Order ID: {orderId}
          </p>
        )}
        <div className="flex flex-col gap-3">
          <Link
            href="/products"
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}

