// app/cart/page.tsx

"use client";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { clearCart, removeFromCart, updateQuantity } from "@/store/slices/cartSlice";
import Image from "next/image";
import Link from "next/link";
import { useDeliveryCharge } from "@/hooks/useDeliveryCharge";

export default function CartPage() {
  const dispatch = useDispatch();
  const cart = useSelector((s: RootState) => s.cart.items);

  const total = cart.reduce(
    (sum, item) => sum + (item.discountedPrice || item.price) * item.quantity,
    0
  );
  const { deliveryCharge } = useDeliveryCharge();
  const grandTotal = total + deliveryCharge;


  const increment = (id: string, qty: number) =>
    dispatch(updateQuantity({ id, quantity: qty + 1 }));

  const decrement = (id: string, qty: number) => {
    if (qty <= 1) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateQuantity({ id, quantity: qty - 1 }));
    }
  };

  return (
    <main className="min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart 🛒</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Browse products and add them to your cart.
            </p>
            <Link
              href="/shop"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 bg-white rounded-xl shadow-sm p-4 border border-gray-100"
                >
                  {/* Thumbnail — guard against empty string src */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-2xl">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ${(item.discountedPrice || item.price).toFixed(2)} each
                    </p>
                    <p className="text-sm font-bold text-indigo-600 mt-0.5">
                      ${((item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => decrement(item._id, item.quantity)}
                        className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold text-gray-700 min-w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increment(item._id, item.quantity)}
                        className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="text-red-400 hover:text-red-600 text-sm font-medium shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 h-fit sticky top-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Summary</h2>

              {/* Item count */}
              <p className="text-xs text-slate-400 mb-3">
                {cart.reduce((n, i) => n + i.quantity, 0)} item
                {cart.reduce((n, i) => n + i.quantity, 0) !== 1 ? "s" : ""} in cart
              </p>

              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-gray-600">Shipping</span>
                <span className={`font-semibold ${deliveryCharge === 0 ? "text-emerald-600" : ""}`}>
                  {deliveryCharge === 0 ? "Free" : `$${deliveryCharge.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-800 border-t border-gray-100 pt-4 mb-6">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <Link href="/checkout">
                <button className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors cursor-pointer">
                  Checkout
                </button>
              </Link>

              <button
                onClick={() => dispatch(clearCart())}
                className="w-full mt-3 py-2.5 rounded-lg bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}

