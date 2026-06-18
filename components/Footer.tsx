import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-zinc-900 border-t border-zinc-100">
      <div className="w-[96%] md:w-[90%] mx-auto px-3 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand Column */}
        <div className="space-y-4">
          <Link href="/" className="text-lg font-medium tracking-widest uppercase">
            Tarnix
          </Link>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
            Premium fashion curated and delivered to your doorstep in hours. Elevating your daily wardrobe with seamless convenience.
          </p>
        </div>

        {/* Support Links */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Assistance</h4>
          <ul className="space-y-2.5 text-sm text-zinc-600">
            <li><Link href="/shipping-policy" className="hover:text-zinc-900 transition-colors">Delivery & Returns</Link></li>
            <li><Link href="/my-orders" className="hover:text-zinc-900 transition-colors">Track Order</Link></li>
            <li><Link href="/story" className="hover:text-zinc-900 transition-colors">Our Story</Link></li>
            <li><Link href="/contact" className="hover:text-zinc-900 transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Newsletter</h4>
          <p className="text-xs text-zinc-500 mb-3">Subscribe to receive updates on drops and styling guides.</p>
          <form className="flex border border-zinc-200 focus-within:border-zinc-900 transition-colors rounded-sm overflow-hidden">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-3 py-2 text-xs bg-transparent focus:outline-none placeholder-zinc-400"
              required
            />
            <button
              type="submit"
              className="bg-zinc-900 text-white text-xs px-4 py-2 uppercase tracking-wider hover:bg-zinc-800 transition-colors"
            >
              Join
            </button>
          </form>
        </div>

        {/* Social Links */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Social Links</h4>
          <ul className="space-y-2.5 text-sm text-zinc-600">
            <li><Link href="/shipping" className="hover:text-zinc-900 transition-colors">Delivery & Returns</Link></li>
            <li><Link href="/track" className="hover:text-zinc-900 transition-colors">Track Order</Link></li>
            <li><Link href="/about" className="hover:text-zinc-900 transition-colors">Our Story</Link></li>
            <li><Link href="/contact" className="hover:text-zinc-900 transition-colors">Contact Us</Link></li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-6xl mx-auto px-6 py-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-zinc-400">
          &copy; {currentYear} Tarnix. All rights reserved.
        </p>
        <div className="flex flex-col gap-0 text-xs text-zinc-400">
          <div>
            <Link href="/privacy" className="hover:text-zinc-600 transition-colors">Privacy Policy</Link>
            <span className='text-zinc-200'> | </span>
            <Link href="/terms" className="hover:text-zinc-600 transition-colors">Terms of Service</Link>
          </div>
          <p className='tracking-widest'>developed by: arif</p>
        </div>
      </div>
    </footer>
  );
}