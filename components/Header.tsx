// components/Header.tsx

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRef, useState } from "react";
import UserNav from "./UserNav";
import MobileNav from "./MobileNav";

type NavbarProps = {
  role: "user" | "admin" | "deliveryBoy" | null;
};

const Header = ({ role }: NavbarProps) => {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAdmin = role === "admin";
  const isDeliveryBoy= role === "deliveryBoy";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md shadow-[0_1px_30px_rgba(0,0,0,0.4)] border-b border-white/20">
      <div className="w-[95%] md:w-[90%] mx-auto px-1 h-16 flex items-center justify-between gap-4">

        {/* Logo + Mobile hamburger */}
        <div className="flex items-center md:hidden gap-3">
          <MobileNav role={role} />
          <Link href="/">
            <h2 className="text-2xl text-tarnix_dark_green font-black tracking-wider hover:text-tarnix_light_green hoverEffect group font-sans">
              Tarnix
            </h2>
          </Link>
        </div>

        {/* ── Logo (all roles) ── */}
        <div className="hidden md:flex items-center">
          <Link href="/">
            <h2 className="text-2xl text-blue-600 font-black tracking-wider hover:text-tarnix_light_green hoverEffect group font-sans">
              Tarnix
            </h2>
          </Link>
        </div>

        {/* ── CENTER: Nav ── */}
        <UserNav />

        {/* ── RIGHT: Auth (all roles) ── */}
        <div className="shrink-0 flex items-center gap-2">

          {/* Admin badge */}
          {/* {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-semibold hover:bg-violet-600/30 transition-all duration-200"
            >
              Admin
            </Link>
          )} */}

          {/* Admin badge (desktop only) */}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className=" flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-700 text-xs font-semibold hover:bg-violet-600/30 transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Dashboard
            </Link>
          )}

          {/* deliveryBoy Badge */}
          {isDeliveryBoy && (
            <Link
              href="/delivery/dashboard"
              className=" flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600/20 border border-green-500/30 text-green-700 text-xs font-semibold hover:bg-green-600/30 transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Dashboard
            </Link>
          )}

          {session?.user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-white/6 border border-white/8 hover:bg-white/10 transition-all duration-200 group cursor-pointer"
              >
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
                      {session.user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="hidden sm:block text-xs text-gray-500 font-medium max-w-25 truncate">
                  {session.user?.name?.split(" ")[0]}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#111827] border border-white/8 shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/6">
                    <p className="text-xs text-slate-500 mb-0.5">Signed in as {session.user?.role?.toString().toUpperCase()}</p>
                    <p className="text-sm text-white font-medium truncate">{session.user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/[0.07] transition-all duration-150" onClick={() => setDropdownOpen(false)}>
                      My Profile
                    </Link>
                    {role === "user" && (
                      <>

                        <Link href="/orders" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/[0.07] transition-all duration-150" onClick={() => setDropdownOpen(false)}>
                          My Orders
                        </Link>
                      </>
                    )}

                    {role === "admin" && (
                      <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-violet-300 hover:text-violet-200 hover:bg-violet-500/10 transition-all duration-150" onClick={() => setDropdownOpen(false)}>
                        Admin Dashboard
                      </Link>
                    )}

                    {role === "deliveryBoy" && (
                      <Link href="/delivery/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/[0.07] transition-all duration-150" onClick={() => setDropdownOpen(false)}>
                        Delivery Dashboard
                      </Link>
                    )}
                  </div>

                  <div className="p-1.5 border-t border-white/6">
                    <button
                      onClick={() => { signOut(); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all duration-200 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
