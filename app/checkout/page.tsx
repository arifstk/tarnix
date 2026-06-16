// app/checkout/page.tsx

"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";
import Link from "next/link";
import { useDeliveryCharge } from "@/hooks/useDeliveryCharge";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export default function CheckoutPage() {
  const cart = useSelector((s: RootState) => s.cart.items);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeError, setStripeError] = useState("");

  const { deliveryCharge } = useDeliveryCharge();

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.discountedPrice || item.price) * item.quantity,
    0
  );

  // Fetch PaymentIntent as soon as cart total is known
  useEffect(() => {
    if (cart.length === 0 || !stripeKey) return;

    fetch("/api/checkout/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Math.round(subtotal * 100) }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setStripeError("Failed to initialize payment.");
      })
      .catch(() => setStripeError("Could not connect to payment server."));
  }, []);  // run once on mount

  if (cart.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Your cart is empty</h2>
          <Link href="/products" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500">
            Shop Now
          </Link>
        </div>
      </main>
    );
  }

  if (!stripeKey) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Stripe not configured</h2>
          <p className="text-sm text-slate-500">
            Add <code className="bg-slate-100 px-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to your <code className="bg-slate-100 px-1 rounded">.env.local</code> and restart the dev server.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-8">Checkout</h1>

        {stripeError && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600">
            ⚠️ {stripeError}
          </div>
        )}

        {/* Wait for clientSecret before rendering Elements */}
        {!clientSecret ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400 text-sm">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Preparing checkout...
          </div>
        ) : (
          // clientSecret passed directly to Elements — required by Stripe
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm cart={cart} subtotal={subtotal} clientSecret={clientSecret} deliveryCharge={deliveryCharge} />
          </Elements>
        )}
      </div>
    </main>
  );
}

