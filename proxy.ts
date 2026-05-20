// proxy.ts

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Admin-only routes
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Logged-in user only routes
  if (pathname.startsWith("/profile") || pathname.startsWith("/orders")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Delivery boy only routes
  if (pathname.startsWith("/delivery")) {
    if (!token || token.role !== "deliveryBoy") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/orders/:path*"],
};
