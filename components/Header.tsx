// components/Header.tsx
// Responsive header: logo (left), nav (center), auth/avatar (right).
// General users see Home, Shop, Hot Deals, About Us.
// Admins additionally see Admin Panel link in the right section.
// Mobile: hamburger collapses the nav.
// Nav links use a split-underline animation that expands from center outward.

"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Hot Deals", href: "/hot-deals" },
  { label: "About Us", href: "/about" },
];

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = (session?.user as any)?.role === "admin";

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // auto signout session if user is deleted
  // useEffect(() => {
  //   if (session !== undefined && session?.user === undefined) {
  //     signOut({ callbackUrl: "/login" });
  //   }
  // }, [session]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md shadow-[0_1px_30px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href={"/"}>
          <h2 className="text-2xl text-tarnix_dark_green font-black tracking-wider hover:text-tarnix_light_green hoverEffect group font-sans">
            Tarnix
          </h2>
        </Link>

        {/* ── CENTER: Nav (desktop) ── */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative group text-sm font-medium transition-colors duration-200 py-1 ${active ? "text-gray-700" : "hover:text-gray-800"
                  }`}
              >

                {link.label}

                {link.label === "Hot Deals" && (
                  <span className="absolute -top-2 -right-3 text-xs bg-rose-500 text-white px-1 rounded-full tracking-tighter">
                    HOT
                  </span>
                )}

                {/* Left half of underline — expands from center to left */}
                <span
                  className={`absolute -bottom-0.5 right-1/2 h-0.5 bg-indigo-400 transition-all duration-300 ease-out ${active
                    ? "w-1/2"
                    : "w-0 group-hover:w-1/2"
                    }`}
                />

                {/* Right half of underline — expands from center to right */}
                <span
                  className={`absolute -bottom-0.5 left-1/2 h-0.5 bg-indigo-400 transition-all duration-300 ease-out ${active
                    ? "w-1/2"
                    : "w-0 group-hover:w-1/2"
                    }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* ── RIGHT: Auth section ── */}
        <div className="shrink-0 flex items-center gap-2">

          {/* Admin badge (desktop only) */}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-semibold hover:bg-violet-600/30 transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Admin
            </Link>
          )}

          {session ? (
            /* ── Logged in: avatar + dropdown ── */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-white/6 border border-white/8 hover:bg-white/10 transition-all duration-200 group"
              >
                {/* Avatar */}
                <div className="relative w-7 h-7 rounded-full overflow-hidden ring-1 ring-indigo-500/60 shrink-0">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "avatar"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                      {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                </div>

                {/* Name (hidden on small screens) */}
                <span className="hidden sm:block text-xs text-gray-500 font-medium max-w-25 truncate">
                  {session.user?.name?.split(" ")[0]}
                </span>

                {/* Chevron */}
                <svg
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#111827] border border-white/8 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-1000">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-white/6">
                    <p className="text-xs text-slate-500 mb-0.5">Signed in as</p>
                    <p className="text-sm text-white font-medium truncate">{session.user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/[0.07] transition-all duration-150"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      My Profile
                    </Link>

                    <Link
                      href="/orders"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/[0.07] transition-all duration-150"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                      </svg>
                      My Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-violet-300 hover:text-violet-200 hover:bg-violet-500/10 transition-all duration-150"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}
                  </div>

                  <div className="p-1.5 border-t border-white/6">
                    <button
                      onClick={() => { signOut(); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Logged out: Sign in button ── */
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all duration-200 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign In
            </Link>
          )}

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg  transition-all duration-200"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile nav drawer ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/6 bg-[#0a0f1e]/95 backdrop-blur-md">
          <nav className="max-w-7xl mx-auto px-4 py-3 h-screen space-y-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${active
                    ? "text-indigo-200 bg-[#0a0f1e]/85"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                >
                  {link.label}
                  {link.label === "Hot Deals" && (
                    <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full font-semibold">
                      HOT
                    </span>
                  )}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-violet-300 hover:text-violet-200 hover:bg-violet-500/10 transition-all duration-150"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}