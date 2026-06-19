import React from 'react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  const lastUpdated = "June 19, 2026";

  return (
    <main className="bg-white text-zinc-900 min-h-screen max-w-6xl mx-auto px-2">
      {/* Top Header Section */}
      <section className="pt-8 md:pt-15 pb-6 border-b border-zinc-100">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">User Agreement</span>
        <h1 className="text-3xl font-light tracking-tight mt-3 mb-2">Terms of Service</h1>
        <p className="text-xs text-zinc-400 font-mono">Last updated: {lastUpdated}</p>
      </section>

      {/* Terms Content */}
      <section className=" py-6 space-y-6 text-sm text-zinc-600 leading-relaxed font-light">

        <p>
          Welcome to Tarnix. These Terms of Service govern your use of our website, mobile interface, and our on-demand courier fulfillment services. By accessing our platform or making a purchase, you agree to comply with and be bound by these terms.
        </p>

        {/* Section 1 */}
        <div className="space-y-4">
          <h2 className="text-base font-normal tracking-tight text-zinc-900">1. Account Creation & Eligibility</h2>
          <p>
            To place an on-demand order with Tarnix, you must create a secure verified account. You agree to provide accurate, current, and complete information during registration. You are solely responsible for safeguarding the credentials to your account and ensuring your delivery contact phone number is accurate.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <h2 className="text-base font-normal tracking-tight text-zinc-900">2. On-Demand Logistics & Delivery Windows</h2>
          <p>
            Tarnix prides itself on rapid delivery intervals (typically 90 minutes or scheduled 2-hour blocks). However, delivery timeframes are estimates and can fluctuate based on extreme weather, high-traffic incidents, or unforeseen localized fulfillment surges.
          </p>
          <p className="text-xs text-zinc-500 bg-zinc-50 p-3 border border-zinc-100 rounded-sm">
            <strong className="text-zinc-900 font-normal block mb-1">Customer Presence Rule:</strong>
            Because items travel via direct local couriers, you must be physically present at the specified address during your selected delivery window. If a courier is unable to gain access or contact you upon arrival, the items will return to the hub and an additional redelivery surcharge may apply.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-4">
          <h2 className="text-base font-normal tracking-tight text-zinc-900">3. Product Availability & Dynamic Pricing</h2>
          <p>
            All garments, footwear, and accessories displayed on Tarnix are subject to real-time regional stock availability. We reserve the right to modify prices, delivery surcharges, or drop limits at any time without prior notice to balance local courier network load capacity.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-4">
          <h2 className="text-base font-normal tracking-tight text-zinc-900">4. Returns & On-site Doorstep Collections</h2>
          <p>
            As outlined in our policy, returns must be logged through your portal and requested within 14 calendar days of fulfillment. Items must remain in brand-new condition with all original brand tags, packaging, and security seals intact. We reserve the right to deny returns that show physical signs of usage, washing, or lingering cosmetic marks.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-4">
          <h2 className="text-base font-normal tracking-tight text-zinc-900">5. Limitation of Liability</h2>
          <p>
            Tarnix shall not be liable for any indirect, incidental, or consequential damages resulting from the use of, or inability to use, our logistical platform, including delays caused by external digital service outages or courier partner network interruptions.
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-4">
          <h2 className="text-base font-normal tracking-tight text-zinc-900">6. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with local regulations, and any disputes relating to these terms will be subject to the exclusive jurisdiction of the designated regional courts.
          </p>
        </div>

        {/* Support Callout */}
        <div className="pt-8 border-t border-zinc-100 flex justify-between items-center text-xs text-zinc-400">
          <p>For operations or legal issues: support@tarnix.com</p>
          <Link href="/privacy" className="underline hover:text-zinc-600 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </section>
    </main>
  );
}

