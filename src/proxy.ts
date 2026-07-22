import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;

  // Admin routes — ADMIN only
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn || role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/login?callbackUrl=/admin", nextUrl));
    }
  }

  // Dealer routes — DEALER or ADMIN
  if (nextUrl.pathname.startsWith("/dealer")) {
    if (!isLoggedIn || (role !== "DEALER" && role !== "ADMIN")) {
      return NextResponse.redirect(new URL("/auth/login?callbackUrl=/dealer", nextUrl));
    }
  }

  // Customer routes — any authenticated user
  if (nextUrl.pathname.startsWith("/customer")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${nextUrl.pathname}`, nextUrl)
      );
    }
  }

  // API protection
  if (nextUrl.pathname.startsWith("/api/admin")) {
    if (!isLoggedIn || role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  if (nextUrl.pathname.startsWith("/api/dealer")) {
    if (!isLoggedIn || (role !== "DEALER" && role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  if (nextUrl.pathname.startsWith("/api/customer")) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
