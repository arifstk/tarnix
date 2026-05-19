// components/Header.tsx — Responsive nav with session-aware auth buttons and admin link

"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-400 tracking-tight">
          MyShop
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {isAdmin && (
            <Link href="/admin/dashboard" className="text-indigo-300 hover:text-white transition">
              Admin Panel
            </Link>
          )}
          {session ? (
            <div className="flex items-center gap-3">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-indigo-500"
                />
              )}
              <span className="text-slate-300">{session.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-slate-200"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition font-medium"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

