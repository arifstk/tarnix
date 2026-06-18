import React from 'react';
import { Truck, RotateCcw, Clock, ShieldCheck } from 'lucide-react'; // Optional: npm i lucide-react if you use icons

export default function DeliveryReturnsPage() {
  return (
    <main className="bg-white text-zinc-900 min-h-screen">
      {/* Header */}
      <section className="w-[96%] md:w-[80%] mx-auto pt-15 pb-12 text-center">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Customer Care</span>
        <h1 className="text-3xl font-light tracking-tight mt-3 mb-4">Delivery & Returns</h1>
        <p className="text-zinc-500 text-sm max-w-lg mx-auto">
          Everything you need to know about receiving your Tarnix pieces and our hassle-free return process.
        </p>
      </section>

      {/* Quick Info Grid */}
      <section className="max-w-5xl mx-auto px-2 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border border-zinc-100 p-6 rounded-sm">
          <Clock className="w-5 h-5 text-zinc-400 mb-3 stroke-[1.5]" />
          <h3 className="text-sm font-medium mb-1">Instant Delivery</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">Orders delivered to your doorstep within 60 to 90 minutes.</p>
        </div>
        <div className="border border-zinc-100 p-6 rounded-sm">
          <Truck className="w-5 h-5 text-zinc-400 mb-3 stroke-[1.5]" />
          <h3 className="text-sm font-medium mb-1">Eco Logistics</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">Our electric courier fleet ensures a zero-carbon transit footprint.</p>
        </div>
        <div className="border border-zinc-100 p-6 rounded-sm">
          <RotateCcw className="w-5 h-5 text-zinc-400 mb-3 stroke-[1.5]" />
          <h3 className="text-sm font-medium mb-1">14-Day Returns</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">Not the perfect fit? We will pick up your return right from your door.</p>
        </div>
        <div className="border border-zinc-100 p-6 rounded-sm">
          <ShieldCheck className="w-5 h-5 text-zinc-400 mb-3 stroke-[1.5]" />
          <h3 className="text-sm font-medium mb-1">Secure Packaging</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">All garments arrive in garment bags, ready to wear immediately.</p>
        </div>
      </section>

      {/* Main Details Section */}
      <section className="max-w-3xl mx-auto px-2 py-12 space-y-16">

        {/* Delivery Policy */}
        <div>
          <h2 className="text-xl font-light tracking-tight border-b border-zinc-100 pb-3 mb-6">Delivery Timelines & Rates</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-sm font-medium">On-Demand Priority Delivery</h4>
                <span className="text-sm font-light text-zinc-500">Free / $9.99</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Delivered within 90 minutes of ordering. Free for orders over $150, otherwise a flat fee applies. Available Monday through Sunday, 8 AM – 10 PM.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-sm font-medium">Same-Day Scheduled</h4>
                <span className="text-sm font-light text-zinc-500">Free</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Select a convenient 2-hour delivery window at checkout. Available for all orders placed before 4 PM.
              </p>
            </div>
          </div>
        </div>

        {/* Returns Policy */}
        <div>
          <h2 className="text-xl font-light tracking-tight border-b border-zinc-100 pb-3 mb-6">Effortless Returns</h2>
          <p className="text-xs text-zinc-600 leading-relaxed mb-6">
            At Tarnix, we want you to feel confident in your styling. If an item isn't exactly what you expected, we offer a complimentary doorstep return collection service within 14 days of delivery.
          </p>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">How it works:</h4>
            <ol className="list-decimal list-inside space-y-3 text-xs text-zinc-600">
              <li>Head to your account dashboard and navigate to <strong className="text-zinc-900 font-normal">My Orders</strong>.</li>
              <li>Select the item(s) you wish to return and choose <strong className="text-zinc-900 font-normal">Schedule a Return Pick-up</strong>.</li>
              <li>Pack the items back into the original Tarnix delivery bag with original tags attached.</li>
              <li>A Tarnix courier will arrive within your chosen window to inspect and collect the return.</li>
            </ol>
          </div>

          <div className="mt-8 bg-zinc-50 p-4 rounded-sm border border-zinc-100">
            <h4 className="text-xs font-medium mb-1">Return Conditions</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Items must be unworn, unwashed, and undamaged with all original designer tags and sanitary seals entirely intact. Footwear must include the original designer box in pristine condition.
            </p>
          </div>
        </div>

        {/* Support Callout */}
        <div className="text-center pt-8 border-t border-zinc-100">
          <p className="text-xs text-zinc-500">
            Have an urgent question about an ongoing delivery?
          </p>
          <a href="/contact" className="inline-block text-xs font-medium underline mt-2 hover:text-zinc-600 transition-colors">
            Contact Tarnix Courier Support
          </a>
        </div>

      </section>
    </main>
  );
}

