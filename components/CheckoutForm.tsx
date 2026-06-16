// components/CheckoutForm.tsx

"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { clearCart, CartItem } from "@/store/slices/cartSlice";
import toast from "react-hot-toast";
import Image from "next/image";
import { useDeliveryCharge } from "@/hooks/useDeliveryCharge";

interface Props {
  cart: CartItem[];
  subtotal: number;
  clientSecret: string;
  deliveryCharge: number;
}

type PaymentMethod = "cod" | "stripe";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all";

export default function CheckoutForm({ cart, subtotal, clientSecret }: Props) {
  const dispatch = useDispatch();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const { deliveryCharge } = useDeliveryCharge();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const total = subtotal + deliveryCharge;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validateForm = () =>
    ["fullName", "phone", "address", "city", "postalCode", "country"].every(
      (k) => form[k as keyof typeof form].trim() !== ""
    );

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all shipping fields.");
      return;
    }

    setLoading(true);
    let stripePaymentIntentId: string | undefined;

    // ── Stripe confirmation ──
    if (paymentMethod === "stripe") {
      if (!stripe || !elements) {
        toast.error("Payment not ready yet.");
        setLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed.");
        setLoading(false);
        return;
      }

      stripePaymentIntentId = paymentIntent?.id;
    }

    // ── Save order ──
    try {
      const res = await fetch("/api/checkout/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item._id,
            name: item.name,
            price: item.discountedPrice || item.price,
            quantity: item.quantity,
            image: item.image || "",
          })),
          shippingAddress: form,
          paymentMethod,
          stripePaymentIntentId,
          subtotal,
          total,
        }),
      });

      const data = await res.json();

      if (data.success) {
        dispatch(clearCart());
        toast.success("Order placed successfully! 🎉");
        router.push(`/order-success?id=${data.orderId}`);
      } else {
        toast.error(data.error || "Failed to place order.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* ── Left: Shipping + Payment ── */}
      <div className="lg:col-span-2 space-y-6">

        {/* Shipping */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Shipping Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Full Name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Address</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="123 Main St" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">City</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="New York" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Postal Code</label>
              <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="10001" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Country</label>
              <input name="country" value={form.country} onChange={handleChange} placeholder="United States" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Payment Method</h2>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={() => setPaymentMethod("cod")}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === "cod" ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
                }`}
            >
              <span className="text-2xl">💵</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">Cash on Delivery</p>
                <p className="text-xs text-slate-400">Pay when you receive</p>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod("stripe")}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === "stripe" ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
                }`}
            >
              <span className="text-2xl">💳</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">Card / Stripe</p>
                <p className="text-xs text-slate-400">Visa, Mastercard, etc.</p>
              </div>
            </button>
          </div>

          {paymentMethod === "cod" && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
              <span className="mt-0.5">ℹ️</span>
              <p>You'll pay in cash when your order is delivered. No upfront payment required.</p>
            </div>
          )}

          {/* PaymentElement always mounted — hidden when COD selected */}
          <div className={paymentMethod === "stripe" ? "mt-2" : "hidden"}>
            <PaymentElement />
          </div>
        </div>
      </div>

      {/* ── Right: Order Summary ── */}
      <div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-4">
          <h2 className="text-base font-bold text-slate-800 mb-4">Order Summary</h2>

          <div className="space-y-3 mb-4">
            {cart.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{item.name}</p>
                  <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-xs font-bold text-slate-700">
                  ${((item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Shipping</span>
              <span className={`font-semibold ${deliveryCharge === 0 ? "text-emerald-600" : "text-slate-700"}`}>
                {deliveryCharge === 0 ? "Free" : `$${deliveryCharge.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-800 pt-2 border-t border-slate-100">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="mt-6 w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Placing Order...
              </>
            ) : (
              <>{paymentMethod === "cod" ? "💵" : "💳"} Place Order</>
            )}
          </button>

          <p className="text-xs text-slate-400 text-center mt-3">
            🔒 Your information is secure and encrypted
          </p>
        </div>
      </div>

    </div>
  );
}