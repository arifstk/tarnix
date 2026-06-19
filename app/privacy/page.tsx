import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const lastUpdated = "June 19, 2026";

  return (
    <main className="bg-white text-zinc-900 min-h-screen max-w-6xl mx-auto px-2">
      {/* Top Header Section */}
      <section className="pt-8 md:pt-15 pb-6 border-b border-zinc-100">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Legal Documentation</span>
        <h1 className="text-3xl font-light tracking-tight mt-3 mb-2">Privacy Policy</h1>
        <p className="text-xs text-zinc-400 font-mono">Last updated: {lastUpdated}</p>
      </section>

      {/* Policy Content */}
      <section className="py-6 space-y-6 text-sm text-zinc-600 leading-relaxed font-light">

        <p>
          At Tarnix, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website or mobile application and tell you about your privacy rights and how the law protects you.
        </p>

        {/* Section 1 */}
        <div className="space-y-4">
          <h2 className="text-base font-normal tracking-tight text-zinc-900">1. Data We Collect About You</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2 text-xs">
            <li><strong className="text-zinc-900 font-normal">Identity Data:</strong> includes first name, last name, and username.</li>
            <li><strong className="text-zinc-900 font-normal">Contact Data:</strong> includes billing address, delivery address, email address, and telephone numbers.</li>
            <li><strong className="text-zinc-900 font-normal">Financial Data:</strong> includes payment card details (processed securely via encrypted third-party gateways).</li>
            <li><strong className="text-zinc-900 font-normal">Technical & Location Data:</strong> includes real-time geolocation data (necessary to facilitate our 90-minute courier dispatch), IP address, browser type, and operating system.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <h2 className="text-base font-normal tracking-tight text-zinc-900">2. How We Use Your Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we use your personal data in the following circumstances:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2 text-xs">
            <li>To register you as a new customer and handle ongoing account management.</li>
            <li>To process and deliver your on-demand order, including real-time courier sharing.</li>
            <li>To manage payments, fees, and sudden doorstep returns.</li>
            <li>To notify you about critical updates to our services or temporary shifts in local dispatch boundaries.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-4">
          <h2 className="text-base font-normal tracking-tight text-zinc-900">3. Data Disclosures & Courier Sharing</h2>
          <p>
            To successfully execute our signature fast-fulfillment model, your <strong className="text-zinc-900 font-normal">Contact Data</strong> and precise <strong className="text-zinc-900 font-normal">Delivery Address</strong> are shared explicitly with our contracted courier fleets. They are contractually bound to treat your information securely and delete routing logs after deliveries are cleared. We do not sell or monetize your underlying personal fashion data to third-party advertisers.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-4">
          <h2 className="text-base font-normal tracking-tight text-zinc-900">4. Data Retention & Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way. We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-4">
          <h2 className="text-base font-normal tracking-tight text-zinc-900">5. Your Legal Rights</h2>
          <p>
            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, or restriction of processing. If you wish to permanently delete your account and associated delivery logs, please contact us.
          </p>
        </div>

        {/* Support Callout */}
        <div className="pt-8 border-t border-zinc-100 flex justify-between items-center text-xs text-zinc-400">
          <p>Questions? Contact legal@tarnix.com</p>
          <Link href="/terms" className="underline hover:text-zinc-600 transition-colors">
            Terms of Service
          </Link>
        </div>
      </section>
    </main>
  );
}

